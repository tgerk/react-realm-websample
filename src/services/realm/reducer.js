// This reducer's concerns are migrating to ApolloClient in GraphQL context
export const actions = {
  CURRENT_USER: "set current user",
  GET_RESTAURANTS: "get restaurants",
  IN_FLIGHT_BEGIN: "query in-progress",
  IN_FLIGHT_COMPLETE: "query resolved",
};

export default function realmReducer(state, { type, payload = {} }) {
  switch (type) {
    case actions.CURRENT_USER: {
      const { user, ...rest } = state;
      if (payload) {
        return { ...state, user: payload };
      }

      return rest;
    }

    case actions.IN_FLIGHT_BEGIN:
    case actions.IN_FLIGHT_COMPLETE: {
      const { inFlight: orig, ...rest } = state,
        inFlight = inFlightReducer(orig, { type, payload });
      if (inFlight) {
        return { ...state, inFlight };
      }
      return rest;
    }

    case actions.GET_RESTAURANTS:
      return { ...state, restaurants: payload };

    default:
      break;
  }

  return state;
}

function inFlightReducer(state = 0, { type }) {
  switch (type) {
    default:
      break;
    case actions.IN_FLIGHT_BEGIN:
      return state + 1;
    case actions.IN_FLIGHT_COMPLETE:
      return Math.max(state - 1, 0);
  }

  return state;
}
