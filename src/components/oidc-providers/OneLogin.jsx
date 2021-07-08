import React from "react";
import crypto from "crypto";

const PKCE_AUTH_CHALLENGE = "pkce_challenge";
function pkce_challenge(verify = false) {
  if (verify) {
    const { code_verifier } = sessionStorage.getJSONItem(
      PKCE_AUTH_CHALLENGE,
      null
    );
    return { code_verifier };
  }

  const code_verifier = crypto.randomBytes(32).toString("hex"),
    code_challenge = crypto
      .createHash("sha256")
      .update(code_verifier)
      .digest("base64")
      .replace(/[=+/]/g, (m) => ({ "=": "", "+": "-", "/": "_" }[m]));

  sessionStorage.setJSONItem(PKCE_AUTH_CHALLENGE, {
    code_challenge,
    code_verifier,
  });
  return { code_challenge_method: "S256", code_challenge };
}

function oneloginRedirectUrl() {
  const url = new URL("/oidc/onelogin", window.location.origin);
  return url.href;
}

function oneloginAuthUrl() {
  return `https://${
    process.env.REACT_APP_ONELOGIN_SUBDOMAIN
  }.onelogin.com/oidc/2/auth?${new URLSearchParams({
    redirect_uri: oneloginRedirectUrl(),
    client_id: process.env.REACT_APP_ONELOGIN_CLIENT_ID,
    response_type: "code",
    scope: "openid profile",
    prompt: "login", // login_hint, nonce, state,
    ...pkce_challenge(),
  })}`;
}

export default function OneLogin() {
  return (
    <button
      name="onelogin"
      onClick={() => {
        // navigate to onelogin authorization endpoint
        window.location = oneloginAuthUrl();
      }}
    >
      Login with OneLogin
    </button>
  );
}

export function oneloginAuth(search) {
  const { error_description: error, code } = search;
  console.debug(search);

  if (error) {
    return Promise.reject(error);
  }

  // use fetch to avoid CORS nastiness that happened with axios
  return fetch(
    `https://${process.env.REACT_APP_ONELOGIN_SUBDOMAIN}.onelogin.com/oidc/2/token`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: process.env.REACT_APP_ONELOGIN_CLIENT_ID,
        redirect_uri: oneloginRedirectUrl(),
        ...pkce_challenge(true),
      }),
    }
  ).then(
    (response) => {
      sessionStorage.removeItem(PKCE_AUTH_CHALLENGE);

      if (response.ok) {
        return response.json();
      }

      return response.text().then((body) => {
        console.error(body);
        return Promise.reject(response.statusText);
      });
    },
    (err) => {
      /* network error */
    }
  );
}
