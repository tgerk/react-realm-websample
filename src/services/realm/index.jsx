import React, { useContext, useEffect, useReducer, useState } from "react";

import { UserContext } from "services/user";

import realmReducer from "./reducer";
import RealmAPI, { SESSION_REALM_TOKENS_KEY } from "./api";

const RealmContext = React.createContext([{}, () => {}]);

export default function RealmContextProvider(props) {
  // create a reducer to manage internal state, get a dispatch method
  // create an API gateway instance that dispatches state transitions to the reducer
  const [state, dispatch] = useReducer(realmReducer, {
      userTokens: sessionStorage.getJSONItem(SESSION_REALM_TOKENS_KEY, {}),
      restaurantsById: {},
    }),
    dispatcher = (type, payload) => dispatch({ type, payload }),
    [api] = useState(new RealmAPI(dispatcher));

  const [currentUser] = useContext(UserContext); // observe user-state changes
  useEffect(() => {
    console.info("Realm context authorizing user", currentUser);
    api.auth(currentUser);
  }, [api, currentUser]);

  return <RealmContext.Provider value={[state, api]} {...props} />;
}

export function useRealm() {
  return useContext(RealmContext);
}

export function useDebouncedEffect(fn, minInterval = 400, dependencies) {
  // the first call should not be delayed, but may be pre-empted
  const [delay, setDelay] = useState(0);

  useEffect(() => {
    let cleanup = setTimeout(() => {
      setDelay(minInterval);
      cleanup = fn(); // clearTimeout no longer effective, instead need (for examaple) to cancel the query in-flight
    }, delay);

    return () =>
      cleanup &&
      (cleanup instanceof Function ? cleanup() : clearTimeout(cleanup));
  }, dependencies); // eslint-disable-line
}
