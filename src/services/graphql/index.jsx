import React, { useState, useEffect, useRef } from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  useQuery,
} from "@apollo/client";

import { useRealm } from "services/realm";

import { CUISINES_QUERY, RESTAURANT_QUERY } from "./queries";

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

// module variable to hold a bound function needed for authentication-error recovery
// TODO: probably could move this into a custom ApolloLink middleware--that seems the
//  preferred facility for handling common classes of error;
let refreshUserTokens = () => {};
function handleNetworkError({ result: { error_code, error } = {} }) {
  if (
    error_code === "InvalidSession" &&
    error.match(/access token expired$/)
  ) {
    refreshUserTokens();
  }
}

export default function GraphContextProvider(props) {
  const [{ userTokens = {} }, api] = useRealm(), // observe user token changes
    [client, setClient] = useState(makeClient(userTokens)),
    accessTokenRef = useRef(userTokens.access_token);

  // to kick off a process that will update userTokens in RealmContext
  refreshUserTokens = api.authRefresh.bind(api, userTokens);

  useEffect(() => {
    // skip this effect if user access_token is not changing
    // initial value should be used for the first render, but then this effect would trigger
    //  an immediate re-render even though the initial value has not changed (it's not
    //  apparent how to set dependencies' previous/initial values for the first call, so
    //  we duplicate the dependencies capability with a ref)
    if (userTokens.access_token !== accessTokenRef.current) {
      console.info("Apollo client updating tokens", userTokens);
      accessTokenRef.current = userTokens.access_token;
      setClient(makeClient(userTokens));
    }
  }, [userTokens]);

  return <ApolloProvider client={client} {...props} />;
}

export function useCuisines() {
  const { loading, error = {} , data: { cuisines = [] } = {} } = useQuery(CUISINES_QUERY),
    { networkError } = error;

  if (networkError) handleNetworkError(networkError);

  return [cuisines, loading, error];
}

export function useRestaurant(id) {
  const { loading, error = {} , data: { restaurant = {}, reviews = [] } = {} } = useQuery(RESTAURANT_QUERY, { variables: { id }}),
    { networkError } = error;

  if (networkError) handleNetworkError(networkError);

  return [{...restaurant, reviews}, loading, error];
}
