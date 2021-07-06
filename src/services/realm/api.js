import axios from "axios";
import * as Realm from "realm-web";

import "services/storage-json";
import "services/async-property";

import { actions } from "./reducer";

export const SESSION_REALM_TOKENS_KEY = "realmTokens";

const realmApp = new Realm.App({
  id: process.env.REACT_APP_REALM_APP_ID,
});

const ignoreAbortError = (err) => {
  if (!err instanceof Error || err.name !== "AbortError") {
    throw err;
  }
};

function createHttpRealm(tokens, dispatch) {
  const { access_token } = tokens,
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

  return http;
}

class RealmAPI {
  constructor(dispatch) {
    this.dispatch = dispatch;

    // API gateways are created in suspense:  represents a promise that
    //  will be resolved later (through a setter), and has an async getter
    Object.defineAsyncProperty(this, "httpRealm");
    Object.defineAsyncProperty(this, "realmUser");
  }

  // called each time app's user context changes
  auth(user, onAuthError) {
    Promise.all([
      // get anon-user tokens, prepare axios client
      // (may reject on server, app-config, or network issues)
      this.getAnonTokens().then((tokens) => {
        this.dispatch(actions.CHANGE_TOKENS, tokens);

        this.httpRealm = createHttpRealm(tokens, this.dispatch);
      }),

      // and also:
      // get authenticated Realm-Web SDK user
      // (may reject on invalid credentials, server, app-config, or network issues)
      this.getRealmUser(user).then((user) => {
        // for display purposes
        this.dispatch(actions.CURRENT_USER, user);

        this.realmUser = user;
      }),
    ]).catch((error) => {
      // revert both portals to initial unresolved state
      Object.defineAsyncProperty(this, "httpRealm");
      Object.defineAsyncProperty(this, "realmUser");

      // raise authentication error through user object
      onAuthError(error);
    });
  }

  getAnonTokens() {
    const tokens = sessionStorage.getJSONItem(SESSION_REALM_TOKENS_KEY, {});
    if ("access_token" in tokens) {
      // TODO: verify or refresh access_token
      return Promise.resolve(tokens);
    }

    console.info("getting realm anonymous user credential");
    return axios
      .request({
        url: process.env.REACT_APP_BASE_URL_REALM_AUTH_ANON,
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
      })
      .then(({ data: tokens }) => {
        sessionStorage.setJSONItem(SESSION_REALM_TOKENS_KEY, tokens);
        return tokens;
      });
  }

  refreshAuth(tokens) {
    // all queries simultaneously in-flight will fail for same reason: expired access_token
    // issue only one token refresh request per 5 minutes
    if (this.refreshInProgress) {
      console.info("token refresh already in progress");
      return;
    } else {
      this.refreshInProgress = true;
      setTimeout(() => {
        delete this.refreshInProgress;
      }, 5 * 60 * 1000);
    }

    // defer future queries until refresh is resolved
    Object.defineAsyncProperty(this, "httpRealm");
    this.refreshAuthToken(tokens).then((tokens) => {
      this.dispatch(actions.CHANGE_TOKENS, tokens);

      this.httpRealm = createHttpRealm(tokens, this.dispatch);
    });
  }

  refreshAuthToken(tokens) {
    const { refresh_token } = tokens;
    console.log("refreshing realm access token");
    return axios
      .request({
        url: process.env.REACT_APP_BASE_URL_REALM_AUTH_REFRESH,
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${refresh_token}`,
        },
      })
      .then(({ data }) => {
        tokens = { ...tokens, ...data }; // replace the old access_token
        sessionStorage.setJSONItem(SESSION_REALM_TOKENS_KEY, tokens);
        return tokens;
      });
  }

  getRealmUser(user) {
    if (user) {
      const { provider, email, password } = user;
      switch (provider) {
        case "google": // for example
          console.assert("google auth not implemented");
          break;

        default:
          if (email && password) {
            console.info("logging into realm app with email/password");
            return realmApp.logIn(
              Realm.Credentials.emailPassword(email, password)
            );
          }
      }
    }

    console.info("logging into realm app anonymously");
    return realmApp.logIn(Realm.Credentials.anonymous());
  }

  // give a means for automatic & pro-active refresh of access token, therefore access token
  //  used by Apollo GraphQL Client is a _dynamic_ api property (rather than Realm context state)
  get realmAccessToken() {
    // TODO: could we use realmApp.currentUser & also assure that SDK authentication had completed?
    return this.realmUser.then((user) =>
      // updates expired access_token
      // TODO: should optimally call only when the access_token is close to expiration?
      user.refreshCustomData().then(() => user.accessToken)
    );
  }

  getCuisines() {
    console.assert("deprecated, use GraphQL useCuisines custom hook");

    const source = axios.CancelToken.source(),
      q = this.httpRealm
        .then((http) => http.get("cuisines", { cancelToken: source.token }))
        .then(({ data }) => this.dispatch(actions.GET_CUISINES, data))
        .catch(ignoreAbortError);

    // why returning the promise, and not just the cancel (cleanup) function?
    q.cancel = source.cancel;
    return q;
  }

  getRestaurants(page = {}, query = {}) {
    // TODO: shouldn't we check if state is already up-to-date with parameters?
    // can state be inspected (read-only, of course!) from this.dispatch?
    // I could dispatch an action with a conditional callback, but then I wouldn't
    //  be able to return the [cancelable] Promise...sad :(

    //TODO: caching --> use graphql & ApolloClient, lol.

    const source = axios.CancelToken.source(),
      q = this.httpRealm
        .then((http) =>
          http.get("restaurants", {
            params: new URLSearchParams({ ...query, ...page }),
            cancelToken: source.token,
          })
        )
        .then(({ data }) =>
          this.dispatch(actions.GET_RESTAURANTS, { query, ...data })
        )
        .catch(ignoreAbortError);

    // why returning the promise, and not just the cancel (cleanup) function?
    q.cancel = source.cancel;
    return q;
  }

  getRestaurant(id) {
    console.assert("deprecated, use GraphQL useRestaurant custom hook");

    return this.httpRealm
      .then((http) =>
        http.get("restaurants", {
          params: new URLSearchParams({ id }),
        })
      )
      .then(({ data: restaurant }) =>
        this.dispatch(actions.GET_RESTAURANT, restaurant)
      );
  }

  createReview(data) {
    console.assert("deprecated, use GraphQL useUpsertReview custom hook");

    this.dispatch(actions.ADD_REVIEW, data); // optimistic
    return this.httpRealm.then((http) => http.post("reviews", data));
    // TODO: catch failure, invalidate restaurant
  }

  updateReview(id, { userId, ...data }) {
    console.assert("deprecated, use GraphQL useUpsertReview custom hook");

    this.dispatch(actions.EDIT_REVIEW, { id, userId, ...data }); // optimistic
    return this.httpRealm.then((http) =>
      http.put("reviews", data, {
        params: new URLSearchParams({ id, userId }),
      })
    );
    // TODO: catch failure, invalidate restaurant
  }

  deleteReview(id, userId, restaurantId) {
    console.assert("deprecated, use GraphQL useDeleteReview custom hook");

    this.dispatch(actions.DELETE_REVIEW, { id, restaurantId }); // optimistic
    return this.httpRealm.then((http) =>
      http.delete("reviews", { params: new URLSearchParams({ id, userId }) })
    );
    // TODO: catch failure, invalidate restaurant
  }
}

export default RealmAPI;
