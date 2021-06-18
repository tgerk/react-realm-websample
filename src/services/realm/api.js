import axios from "axios";
import * as Realm from "realm-web";

import "services/storage-json";

import { actions } from "./reducer";

const SESSION_REALM_TOKENS_KEY = "realmTokens";

const ignoreAbortError = (err) => {
  if (!err instanceof Error || err.name !== "AbortError") {
    throw err;
  }
};

class RealmAPI {
  constructor(dispatch) {
    this.dispatch = dispatch;
    this.realmApp = new Realm.App({ id: process.env.REACT_APP_REALM_APP_ID });

    // setup three clients, two cannot be used without authorization
    this.http = axios.create({
      baseURL: process.env.REACT_APP_BASE_URL,
      headers: {
        "Content-type": "application/json",
      },
    });
    this.httpRealm = new Promise((resolve, reject) => {
      this.setHttpRealm = resolve;
    });
    this.realmUser = new Promise((resolve, reject) => {
      this.setRealmUser = resolve;
    });
  }

  auth(user) {
    const self = this; // for nested functions

    // There are two patterns:  call functions via Web-SDK, or via webhooks
    // each has its own auth scheme, spawned concurrently

    if (!this.setHttpRealm) {
      return; // eslint-disable-next-line
      this.httpRealm = new Promise((resolve, reject) => {
        this.setHttpRealm = resolve;
      });
    }

    authHttp(user).then((v) => {
      this.setHttpRealm(v);
      delete this.setHttpRealm;
    });

    if (!this.setRealmUser) {
      this.realmUser = new Promise((resolve, reject) => {
        this.setRealmUser = resolve;
      });
    }

    return; // eslint-disable-next-line
    authRealm(user).then((v) => {
      this.setRealmUser(v);
      delete this.setRealmUser;
    });

    function authHttp(user) {
      // Get a bearer token for web-hooks requiring "Application Authentication"
      // Webhook Application Authentication does include Anon-user; these have been changed
      //  to run with "System" authentication.  Expect anon-user may be useful for indirect cases?

      const { access_token } = sessionStorage.getJSONItem(
        SESSION_REALM_TOKENS_KEY,
        {}
      );
      if (access_token) {
        // TODO: verify or refresh access_token
        return Promise.resolve(createHttpRealm(access_token));
      }

      console.info("getting realm anonymous user credential");
      return axios
        .post(process.env.REACT_APP_BASE_URL_REALM_AUTH_ANON, {
          headers: {
            "Content-type": "application/json",
          },
        })
        .then(({ data: tokens }) => {
          sessionStorage.setJSONItem(SESSION_REALM_TOKENS_KEY, tokens);
          return createHttpRealm(tokens.access_token);
        });

      function createHttpRealm(access_token) {
        const http = axios.create({
          baseURL: process.env.REACT_APP_BASE_URL_REALM,
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });

        http.interceptors.request.use((config) => {
          self.dispatch(actions.IN_FLIGHT_BEGIN);
          return config;
        });
        http.interceptors.response.use((response) => {
          self.dispatch(actions.IN_FLIGHT_COMPLETE);
          return response;
        });

        return http;
      }
    }

    function authRealm(user) {
      console.info("logging into realm app anonymously");
      return this.realmApp.logIn(Realm.Credentials.anonymous());

      // or, for example, if Google authentication provider is enabled:
      // this.realmUser = realmApp.logIn(Realm.Credentials.google(user.google.credential));
    }
  }

  async getCuisines() {
    const source = axios.CancelToken.source(),
      q = this.httpRealm
        .then((http) => http.get("cuisines", { cancelToken: source.token }))
        .then(({ data }) => this.dispatch(actions.GET_CUISINES, data))
        .catch(ignoreAbortError);

    q.cancel = source.cancel;
    return q;
  }

  async getRestaurants(page = {}, query = {}) {
    // TODO: shouldn't we check if state is already up-to-date with parameters?
    // can state be inspected (read-only, of course!) from this.dispatch?
    // I could dispatch an action with a conditional callback, but then I wouldn't
    //  be able to return the [cancelable] Promise...sad :(

    //TODO: caching

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

    q.cancel = source.cancel;
    return q;
  }

  async getRestaurant(id) {
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

  async createReview(data) {
    this.dispatch(actions.ADD_REVIEW, data); // optimistic
    return this.httpRealm.then((http) => http.post("reviews", data));
    // TODO: catch failure, invalidate restaurant
  }

  async updateReview(id, { userId, ...data }) {
    this.dispatch(actions.EDIT_REVIEW, { id, userId, ...data }); // optimistic
    return this.httpRealm.then((http) =>
      http.put("reviews", data, {
        params: new URLSearchParams({ id, userId }),
      })
    );
    // TODO: catch failure, invalidate restaurant
  }

  async deleteReview(id, userId, restaurantId) {
    this.dispatch(actions.DELETE_REVIEW, { id, restaurantId }); // optimistic
    return this.httpRealm.then((http) =>
      http.delete("reviews", { params: new URLSearchParams({ id, userId }) })
    );
    // TODO: catch failure, invalidate restaurant
  }

  // TODO: add more actions!
}

export default RealmAPI;
