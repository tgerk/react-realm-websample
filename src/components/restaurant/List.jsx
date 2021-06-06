import React from "react";

import Gallery from "Gallery";
import Search from "restaurant/Search";
import RestaurantCard from "restaurant/Card";

import { useRealm } from "services/realm";

//TODO: caching
export default function RestaurantList({ location: { search } }) {
  const [
    {
      restaurants: {
        query,
        restaurants = [],
        count: total,
        nav: links,
        ...data
      } = {},
    },
  ] = useRealm();

  return (
    <div className="restaurants-list">
      <Search
        query={{
          ...query,
          ...Object.fromEntries(new URLSearchParams(search).entries()),
        }}
      />

      {restaurants.length ? (
        <Gallery {...{ total, ...links, ...data }}>
          {restaurants.map((restaurant, i) => (
            <RestaurantCard {...restaurant} key={i} />
          ))}
        </Gallery>
      ) : (
        <p className="loading">Loading...</p>
      )}
    </div>
  );
}
