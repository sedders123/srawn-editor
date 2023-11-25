import { Octokit } from "@octokit/core";
import { useEffect, useMemo, useReducer, useCallback } from "react";
import { redirect, useParams } from "react-router-dom";
import { reducer } from "./reducer";
import { getComments, getIssue } from "./actions";
import { parseIssueName, parseIssueNumber } from "./utils";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useToggle, useStickyState } from "utils";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { useHotkeys } from "react-hotkeys-hook";

const SRAWN_HEADER =
  "The Student Robotics (Almost) Weekly Newsletter is a (roughly) fortnightly newsletter which summarises the goings‐on across Student Robotics. **Emboldened** items are ones for which additional help has been requested.";

const SRAWN_FOOTER = `## Subscribe to SR(A)WN

You can keep up with SR(A)WN online:

- Join the \`#srawn\` channel on [Slack](https://app.slack.com/client/T0EEPF1LH/C01GBT8NMSN) _recommended_
- Join the \`srawn\` mailing list on [Google Groups](https://groups.google.com/g/srawn)
- Read historical issues on the [SR(A)WN Archive](https://studentrobotics.org/srawn)
- Subscribe to the [SR(A)WN RSS Feed](https://studentrobotics.org/srawn/rss.xml)`;

const IssueEditor = () => {
  const { id } = useParams();
  const [token] = useStickyState("", "GH_token");
  const octokit = useMemo(() => new Octokit({ auth: token }), [token]);
  const initialState = { topics: [], issue: null };
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (initialValue) =>
      JSON.parse(localStorage.getItem(`issue-${id}`)) || initialValue,
  );
  const [reordering, toggleReordering] = useToggle(false);

  const split = useCallback(() => {
    const selection = getSelection();
    if (!selection) {
      return;
    }
    const selectedText = selection.toString();
    if (!selectedText) {
      return;
    }
    dispatch({ type: "splitTopic", payload: selectedText });
  }, [dispatch]);

  useEffect(() => {
    async function load() {
      const comments = await getComments(octokit, id);
      dispatch({ type: "loadTopics", payload: comments });

      const issue = await getIssue(octokit, id);
      dispatch({ type: "setIssue", payload: issue });
    }
    if (state.topics.length === 0) {
      load();
    }
  }, [octokit, id, state]);

  useEffect(() => {
    localStorage.setItem(`issue-${id}`, JSON.stringify(state));
  }, [id, state]);

  useHotkeys("alt+s", () => split(), [split]);

  if (!token) {
    return redirect("/");
  }

  const issueNumber = parseIssueNumber(state.issue);
  const issueName = parseIssueName(state.issue);
  const issueYear = issueNumber.split("-")[0];

  const fullIssueBody = state.topics
    .reduce((acc, topic) => {
      return `${acc}\n\n${topic.body}`;
    }, "")
    .trim();

  const fullIssue = `${SRAWN_HEADER}\n\n${fullIssueBody}\n\n${SRAWN_FOOTER}`;

  return (
    <div className="editor">
      <header className="header">
        <a href="/">Home</a>
        <h1>{issueNumber}</h1>
        <div className="actions">
          <button type="button" onClick={toggleReordering}>
            {reordering ? "Done" : "Reorder"}
          </button>
          <button type="button" onClick={split}>
            Split (or <kbd>Alt + S</kbd>)
          </button>
        </div>
      </header>
      <TopicList
        topics={state.topics}
        onRemove={(id) => dispatch({ type: "removeTopic", payload: id })}
        reorderTopics={(topics) =>
          dispatch({ type: "loadTopics", payload: topics })
        }
        draggable={reordering}
        onTopicChange={(id, value) =>
          dispatch({ type: "changeTopic", payload: { id, value } })
        }
        split={split}
      />
      <button
        type="button"
        onClick={() => dispatch({ type: "addTopic", payload: "" })}
      >
        Add Topic
      </button>
      <a
        href={`https://github.com/srobo/srawn/new/main/${issueYear}/?filename=${issueName}.md&value=${encodeURIComponent(
          fullIssue,
        )}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        Create SR(A)WN Issue
      </a>
    </div>
  );
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const TopicList = ({
  topics,
  onRemove,
  reorderTopics,
  draggable,
  onTopicChange,
  split,
}) => {
  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const items = reorder(
        topics,
        result.source.index,
        result.destination.index,
      );
      reorderTopics(items);
    },
    [topics, reorderTopics],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            className="topic-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {topics.map((topic, index) => (
              <Topic
                key={topic.id}
                topic={topic}
                onRemove={onRemove}
                index={index}
                draggable={draggable}
                onChange={(value) => onTopicChange(topic.id, value)}
                split={split}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const Topic = ({ topic, onRemove, index, draggable, onChange, split }) => {
  const markdownHeight = topic.body.split("\n").length * 50;
  const [editing, toggleEditing] = useToggle(false);

  useEffect(() => {
    if (draggable && editing) {
      toggleEditing();
    }
  }, [draggable, editing, toggleEditing]);

  return (
    <Draggable
      draggableId={topic.id.toString()}
      index={index}
      isDragDisabled={!draggable}
    >
      {(provided) => (
        <div
          className="topic"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={() => {
            if (!draggable && !editing) {
              toggleEditing();
            }
          }}
        >
          {editing ? (
            <MDEditor
              value={topic.body}
              onChange={onChange}
              previewOptions={{
                rehypePlugins: [rehypeSanitize],
              }}
              height={markdownHeight > 200 ? markdownHeight : 200}
              autoFocus={true}
              // onClickCapture={(e) => {
              //   e.stopPropagation();
              // }}
              onKeyUpCapture={(e) => {
                if (e.key === "Escape") {
                  toggleEditing();
                }
              }}
              onKeyDownCapture={(e) => {
                if (e.key === "s" && e.altKey) {
                  split();
                }
              }}
            />
          ) : (
            <MDEditor.Markdown
              source={topic.body}
              height={markdownHeight > 200 ? markdownHeight : 200}
            />
          )}
          <div className="actions">
            <button
              type="button"
              onClick={(e) => {
                toggleEditing();
                e.stopPropagation();
              }}
              disabled={draggable}
            >
              {editing ? "Done" : "Edit"}
            </button>
            <button type="button" onClick={() => onRemove(topic.id)}>
              Remove
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default IssueEditor;
