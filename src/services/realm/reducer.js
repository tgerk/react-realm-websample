// this module defines both the shape of the state variable and the permissible transitions
// https://orgler.medium.com/dont-use-redux-9e23b5381291 has an interesting near-rant on the
//  dumb over-complication of react-redux done "right"
// I suggest, as complexity increases, separating concerns among several contexts+reducers.
//  Alternatively, compose a reducer from smaller sub-sections of the context-state object
export const actions = {
  CHANGE_USER: "changing user",
  GET_RESTAURANTS: "get restaurants",
  GET_RESTAURANT: "get restaurant",
  GET_CUISINES: "get cuisines",
  ADD_REVIEW: "add review",
  EDIT_REVIEW: "edit review",
  DELETE_REVIEW: "delete review",
  IN_FLIGHT_BEGIN: "query in-progress",
  IN_FLIGHT_COMPLETE: "query resolved",
};

export default function realmReducer(state, { type, payload = {} }) {
  switch (type) {
    default:
    case actions.CHANGE_USER:
      // Realm-issued tokens belong to RealmContext
      // (even though based on identity parameters in the UserContext)
      // When UserContext changes, RealmContext effect will issue API call
      //  to acquire new access/refresh tokens; stored here for consumers
      console.log("rotating user tokens", payload )
      return { ...state, userTokens: payload };

    case actions.IN_FLIGHT_BEGIN:
    case actions.IN_FLIGHT_COMPLETE:
      const { inFlight: orig, ...rest } = state,
        inFlight = inFlightReducer(orig, { type, payload });
      if (inFlight) {
        return { ...rest, inFlight };
      }
      return rest;

    case actions.GET_CUISINES:
      return { ...state, cuisines: payload };

    case actions.GET_RESTAURANTS:
      return { ...state, restaurants: payload };

    case actions.GET_RESTAURANT:
      return {
        ...state,
        restaurantsById: { ...state.restaurantsById, [payload.id]: payload },
      };

    case actions.ADD_REVIEW:
    case actions.EDIT_REVIEW:
    case actions.DELETE_REVIEW: {
      const {
        restaurantsById: {
          [payload.restaurantId]: { reviews = [], ...restaurant } = {},
        },
      } = state;
      if (payload.restaurantId !== restaurant.id) break;
      return {
        ...state,
        restaurantsById: {
          ...state.restaurantsById,
          [payload.restaurantId]: {
            ...restaurant,
            reviews: reviewsReducer(reviews, { type, payload }),
          },
        },
      };
    }
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

function reviewsReducer(state = [], { type, payload }) {
  switch (type) {
    default:
      break;
    case actions.ADD_REVIEW:
      return [payload, ...state];
    case actions.EDIT_REVIEW:
      return [payload, ...state.filter(({ id }) => id !== payload.id)];
    case actions.DELETE_REVIEW:
      return state.filter(({ id }) => id !== payload.id);
  }

  return state;
}
