import React from "react";

import Gallery from "Gallery";
import RestaurantCard from "restaurant/Card";

import { useRealm } from "services/realm";

export default function RestaurantList() {
  const [
    { restaurants: { restaurants, count: total, nav: links, ...data } = {} },
  ] = useRealm();

  return (
    <div className="restaurants-list">
      {restaurants?.length ? (
        <Gallery {...{ total, ...links, ...data }}>
          {restaurants.map((restaurant) => (
            <RestaurantCard {...restaurant} key={restaurant.id} />
          ))}
        </Gallery>
      ) : restaurants ? (
        <p className="user-info">Sorry, no restaurants</p>
      ) : (
        <p className="user-info pulse">Loading...</p>
      )}
    </div>
  );
}
