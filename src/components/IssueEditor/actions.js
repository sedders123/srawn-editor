export const getIssue = async (octokit, id) => {
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}",
    {
      owner: "srobo",
      repo: "srawn",
      issue_number: id,
    }
  );
  return data;
};

export const getComments = async (octokit, id) => {
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      owner: "srobo",
      repo: "srawn",
      issue_number: id,
    }
  );
  return data;
};
