import { Octokit } from "@octokit/core";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStickyState } from "utils";

const getIssues = async (octokit) => {
  // Get all issues from srobo/srawn that are open and have the label "srawn-submit"
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner: "srobo",
    repo: "srawn",
    state: "open",
    labels: "srawn-submit",
  });
  return data;
};

const CurrentIssues = () => {
  const [token] = useStickyState("", "GH_token");
  const octokit = useMemo(() => new Octokit({ auth: token }), [token]);
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    async function load() {
      const issues = await getIssues(octokit);
      setIssues(issues);
    }
    if (issues === null || issues.length === 0) {
      load();
    }
  }, [octokit, issues]);

  if (!token) {
    return null;
  }

  return (
    <div className="current-issues">
      <h2>Current Issues</h2>
      <ul>
        {issues &&
          issues.map((issue) => (
            <li key={issue.number}>
              <Link to={`/editor/${issue.number}`}>{issue.title}</Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CurrentIssues;
