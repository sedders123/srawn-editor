import { produce } from "immer";

export const reducer = (state, action) => {
  switch (action.type) {
    case "splitTopic": {
      return produce(state, (draftState) => {
        let sourceTopic = draftState.topics.find((topic) =>
          topic.body.includes(action.payload)
        );
        if (!sourceTopic) {
          return draftState;
        }

        sourceTopic.body = sourceTopic.body.replace(action.payload, "").trim();

        const splitTopic = {
          ...sourceTopic,
          id: Date.now(),
          body: action.payload.trim(),
        };

        draftState.topics.push(splitTopic);
      });
    }
    case "loadTopics": {
      return {
        ...state,
        topics: action.payload.map((topic) => ({
          ...topic,
          body: topic.body.trim(),
        })),
      };
    }
    case "removeTopic": {
      return produce(state, (draftState) => {
        const index = draftState.topics.findIndex(
          (topic) => topic.id === action.payload
        );
        if (index === -1) {
          return draftState;
        }

        draftState.topics.splice(index, 1);
      });
    }
    case "addTopic": {
      return produce(state, (draftState) => {
        draftState.topics.push({
          id: Date.now(),
          body: action.payload.trim(),
        });
      });
    }
    case "changeTopic": {
      return produce(state, (draftState) => {
        const index = draftState.topics.findIndex(
          (topic) => topic.id === action.payload.id
        );
        if (index === -1) {
          return draftState;
        }

        draftState.topics[index].body = action.payload.value;
      });
    }
    case "setIssue": {
      return {
        ...state,
        issue: action.payload,
      };
    }
    default:
      return state;
  }
};
