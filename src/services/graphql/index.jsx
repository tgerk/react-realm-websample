import React, { useState, useEffect, useRef } from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  useQuery,
} from "@apollo/client";

import { useRealm } from "services/realm";

import { CUISINES_QUERY } from "./queries";

function makeClient({ access_token } = {}) {
  const options = {
    uri: process.env.REACT_APP_GRAPHQL_REALM,
    headers: {},
  };

  if (access_token) {
    options.headers["Authorization"] = `Bearer ${access_token}`;
  }

  return new ApolloClient({
    link: createHttpLink(options),
    cache: new InMemoryCache(),
  });
}

let refreshUserTokens = () => {};

export default function GraphContextProvider(props) {
  const [{ userTokens = {} }, api] = useRealm(), // observe user token changes
    firstRenderComplete = useRef(),
    [client, setClient] = useState(makeClient(userTokens));

  refreshUserTokens = api.authRefresh.bind(api, userTokens);

  useEffect(() => {
    // skip this effect the first time, only want to make a new client on *changes* to the initial value
    if (!firstRenderComplete.current) {
      firstRenderComplete.current = true;
      return;
    }

    console.info("Apollo client changing for changing tokens", userTokens);
    setClient(makeClient(userTokens));
  }, [userTokens]);

  return <ApolloProvider client={client} {...props} />;
}

// this hook runs many more times than probably necessary.  This depends on changing contexts
//  during initial page load, as well as on the sequence of events in sending a query and
//  receiving results.  Even more if
export function useCuisines() {
  const result = useQuery(CUISINES_QUERY),
    { error: { networkError } = {}, data: { cuisines = [] } = {} } = result;
  // console.debug(result);

  if (networkError) {
    const { error_code, error: error_description } = networkError.result;
    if (
      error_code === "InvalidSession" &&
      error_description.match(/access token expired$/)
    ) {
      refreshUserTokens(); // kick off a process that will update userTokens in RealmContext
      // want (need) to call this just once, seems there are many instances(?) of the calling
      //  component as UserContext and RealmContext effects run
      // NB: cannot conditionally call useMemo
    }
  }

  return cuisines;
}
