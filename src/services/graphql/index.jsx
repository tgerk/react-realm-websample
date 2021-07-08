import React, { useState } from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";

import { useRealm } from "services/realm";

export default function GraphContextProvider(props) {
  // access token is a dynamic property of Realm api object, which encapsulates Realm SDK
  const [, api] = useRealm(),
    [client] = useState(
      new ApolloClient({
        cache: new InMemoryCache(),
        link: createHttpLink({
          uri: process.env.REACT_APP_GRAPHQL_REALM,

          // fetch handler that awaits authentication of a Realm user to get its access token
          fetch: async (uri, options) => {
            options.headers.Authorization = `Bearer ${await api.realmAccessToken}`;
            return fetch(uri, options);
          },
        }),
      })
    );

  return <ApolloProvider client={client} {...props} />;
}

// custom hooks for queries, mutations, and subscriptions are organized in per-entity modules
