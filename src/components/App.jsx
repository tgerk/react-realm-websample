import React from "react";
import { Switch, Route, Link } from "react-router-dom";

import User from "User";
import Restaurant from "Restaurant";
import RestaurantList from "restaurant/List";
import Review from "restaurant/Review";
import Search from "restaurant/Search";

import UserContextProvider from "services/user";
import RealmContextProvider from "services/realm";
import GraphContextProvider from "services/graphql";

export default function App() {
  return (
    <UserContextProvider>
      <RealmContextProvider>
        <GraphContextProvider>
          <nav>
            <a href="/"> Restaurant Reviews </a>
            <ul>
              <li>
                <Route
                  render={({ location: { pathname } }) =>
                    pathname.match(/^\/(|restaurants)$/i) ? (
                      <Search />
                    ) : (
                      <Link to={"/restaurants"}> Restaurants </Link>
                    )
                  }
                />
              </li>
              <li>
                <User />
              </li>
            </ul>
          </nav>

          <main>
            <Switch>
              <Route
                path="/restaurant/:id/review"
                render={(props) => (
                  <Review
                    {...props}
                    restaurantId={props.match.params.id}
                    review={props.location.state?.review || {}}
                  />
                )}
              />

              <Route
                path="/restaurant/:id"
                render={(props) => (
                  <Restaurant {...props} id={props.match.params.id} />
                )}
              />

              <Route component={RestaurantList} />
            </Switch>
          </main>
        </GraphContextProvider>
      </RealmContextProvider>
    </UserContextProvider>
  );
}
