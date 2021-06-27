import React, { useState, useEffect } from "react";
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

export default function GraphContextProvider(props) {
  const [{ userTokens = {} }] = useRealm(), // observe user token changes
    [client, setClient] = useState(makeClient);

  useEffect(() => {
    console.info("Apollo client changing");
    setClient(makeClient(userTokens));
  }, [userTokens]);

  return <ApolloProvider client={client} {...props} />;
}

export function useCuisines() {
  const { data: { cuisines = [] } = {} } = useQuery(CUISINES_QUERY);

  return cuisines;
}
