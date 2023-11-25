import { DateTime } from "luxon";

export const parseIssueNumber = (issue) => {
  if (!issue) {
    return "";
  }
  const lines = issue.body?.split("\n");
  if (!lines || lines.length === 0) {
    return "";
  }

  const srYear = lines.find((line) => line.startsWith("sryear:"));
  const issueNumber = lines.find((line) => line.startsWith("issue:"));

  if (!srYear || !issueNumber) {
    return "";
  }

  const srYearValue = srYear.split(":")[1].trim();
  const issueNumberValue = issueNumber.split(":")[1].trim();

  return `${srYearValue}-${issueNumberValue}`;
};

export const parseIssueName = (issue) => {
  if (!issue) {
    return "";
  }
  const lines = issue.body?.split("\n");
  if (!lines || lines.length === 0) {
    return "";
  }

  const publicationDate = lines.find((line) =>
    line.startsWith("publication-date:")
  );
  const issueNumber = lines.find((line) => line.startsWith("issue:"));

  if (!publicationDate || !issueNumber) {
    return "";
  }

  const publicationDateValue = publicationDate.split(":")[1].trim();
  const issueNumberValue = issueNumber.split(":")[1].trim();

  const publicationDateString =
    DateTime.fromISO(publicationDateValue).toFormat("yyyy-MM-dd");

  return `${publicationDateString}-srawn-${issueNumberValue}`;
};
