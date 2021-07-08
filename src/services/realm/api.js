import axios from "axios";
import * as Realm from "realm-web";

import "services/storage-json";
import "services/async-property";

import { actions } from "./reducer";

const realmApp = new Realm.App({
  id: process.env.REACT_APP_REALM_APP_ID,
});

const ignoreAbortError = (err) => {
  if (!err instanceof Error || err.name !== "AbortError") {
    throw err;
  }
};

export default class RealmAPI {
  constructor(dispatch) {
    this.dispatch = dispatch;

    // API gateway is created in suspense:  represents a promise that
    //  will be resolved later (through a setter), and has an async getter
    Object.defineAsyncProperty(this, "realmUser");
  }

  // called each time app's user context changes
  auth(user) {
    // get authenticated Realm-Web SDK user
    // (may reject on invalid credentials, server, app-config, or network issues)
    return (function (user) {
      if (user) {
        const { email, password, ...providers } = user,
          [[provider, tokens]] = Object.entries(providers); // assume there is just one

        switch (provider) {
          case "google": // for example
            console.assert("google auth not implemented");
            break;

          // integrated with Realm custom-jwt providers
          case "onelogin": {
            const { id_token } = tokens;
            return realmApp.logIn(Realm.Credentials.jwt(id_token));
          }

          default:
            if (email && password) {
              console.info("logging into realm app with email/password");
              return realmApp.logIn(
                Realm.Credentials.emailPassword(email, password)
              );
            }
        }
      }

      console.info("logging into realm app anonymously"); // TODO:  not if an anonymous user is already authenticated, ok?
      return realmApp.logIn(Realm.Credentials.anonymous());
    })(user).then(
      (realmUser) => {
        this.dispatch(actions.CURRENT_USER, realmUser); // for display purposes
        this.realmUser = realmUser;
      },
      ({ statusCode, statusText, errorCode, error }) => {
        // revert to initial unresolved state
        Object.defineAsyncProperty(this, "realmUser");

        throw error;
      }
    );
  }

  // give a means for automatic & pro-active refresh of access token, therefore access token
  //  used by Apollo GraphQL Client is a _dynamic_ api property (rather than Realm context state)
  // use this rather than realmApp.currentUser to assure that SDK authentication had completed
  // must return a promise, getter can't be async
  get realmAccessToken() {
    return this.realmUser.then(
      // refresh access_token
      // TODO: should optimally call only when the access_token is close to expiration?
      (user) => user.refreshCustomData().then(() => user.accessToken)
    );
  }

  async getRestaurants(page = {}, query = {}) {
    // TODO: deprecate this method in favor of graphql, would need a custom resolver on the backend perhaps?
    //  look into paginated & parameterized queries, will win caching, etc.

    const dispatch = this.dispatch,
      access_token = await this.access_token,
      source = axios.CancelToken.source(),
      http = axios.create({
        baseURL: process.env.REACT_APP_BASE_URL_REALM,
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });

    http.interceptors.request.use((config) => {
      dispatch(actions.IN_FLIGHT_BEGIN);
      return config;
    });
    http.interceptors.response.use((response) => {
      dispatch(actions.IN_FLIGHT_COMPLETE);
      return response;
    });

    http
      .get("restaurants", {
        params: new URLSearchParams({ ...query, ...page }),
        cancelToken: source.token,
      })
      .then(
        ({ data }) => dispatch(actions.GET_RESTAURANTS, { query, ...data }),
        ignoreAbortError
      );

    return source.cancel;
  }
}
