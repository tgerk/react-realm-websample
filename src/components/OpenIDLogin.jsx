import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import OneLogin, { oneloginAuth } from "oidc-providers/OneLogin";

import { useCurrentUser } from "services/user";

export default function OidcLoginProviders({ children }) {
  function OidcAuthToken({
    match: {
      params: { provider },
    },
    location: { search },
    history,
  }) {
    search = Object.fromEntries(new URLSearchParams(search).entries());

    const [, setCurrentUser, onAuthError] = useCurrentUser();

    useEffect(() => {
      switch (provider) {
        default:
          break;

        case "onelogin":
          oneloginAuth(search)
            .then((data) => {
              setCurrentUser({ [provider]: data });
            }, onAuthError)
            .finally(() => {
              history.replace("/");
            });
          break;

        // et al
      }
    }, []); // eslint-disable-line

    return null;
  }

  return (
    <React.Fragment>
      <Route path="/oidc/:provider" component={OidcAuthToken} />
      <OneLogin />

      {/* et al */}

      {children}
    </React.Fragment>
  );
}
