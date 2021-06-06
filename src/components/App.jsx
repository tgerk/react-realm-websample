import React from "react";
import { Switch, Route, Link } from "react-router-dom";

import UserLogin from "Login";
import Restaurant from "Restaurant";
import RestaurantList from "restaurant/List";
import Review from "restaurant/Review";

import UserContextProvider from "services/user";
import RealmContextProvider from "services/realm";

export default function App() {
  return (
    <UserContextProvider>
      <nav>
        <a href="/"> Restaurant Reviews </a>
        <ul>
          <li>
            <Link to={"/restaurants"}> Restaurants </Link>
          </li>
          <li>
            <UserLogin />
          </li>
        </ul>
      </nav>

      <RealmContextProvider>
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
      </RealmContextProvider>
    </UserContextProvider>
  );
}
