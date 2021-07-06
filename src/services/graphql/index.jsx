import React, { useState } from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";

import { useRealm } from "services/realm";

export default function GraphContextProvider(props) {
  const [, /* { user } */ api] = useRealm(),
    // access token is a dynamic property of api object
    // the Realm-web SDK performs authentication, this object is (for this revision)
    //  embedded in the Realm api object.  The Realm API object has been a convenient
    //  abstraction for the extended migration among all the possible access methods:
    //  mongo db interface via a custom REST api layer, Realm webhooks, now Realm graphql
    [client] = useState(
      new ApolloClient({
        cache: new InMemoryCache(),
        link: createHttpLink({
          uri: process.env.REACT_APP_GRAPHQL_REALM,

          // fetch handler that assembles authorization header
          fetch: async (uri, options) => {
            const accessToken = await api.realmAccessToken;
            options.headers.Authorization = `Bearer ${accessToken}`;
            return fetch(uri, options);
          },
        }),
      })
    );

  return <ApolloProvider client={client} {...props} />;
}
