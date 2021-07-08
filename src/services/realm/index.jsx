import React, { useContext, useEffect, useReducer, useState } from "react";

import { useCurrentUser } from "services/user";

import realmReducer from "./reducer";
import RealmAPI from "./api";

const RealmContext = React.createContext([{}, () => {}]);

export default function RealmContextProvider(props) {
  // create a reducer to manage internal state, get a dispatch method
  // create an API gateway instance that does work and dispatches actions to the reducer
  const [currentUser, , [authError, onAuthError]] = useCurrentUser(),
      [state, dispatch] = useReducer(realmReducer, {}),
    [api] = useState(new RealmAPI((type, payload) => dispatch({ type, payload })));

  useEffect(() => {
    if (!authError) {
      api.auth(currentUser).catch(onAuthError);
    }
  }, [api, currentUser, authError, onAuthError]);

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
