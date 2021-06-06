import React from "react";

import Bubble from "Bubble";
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
        restaurants,
        count: total,
        nav: links,
        ...data
      } = {},
    },
  ] = useRealm();

  return (
    <div className="restaurants-list">
      <Bubble affordance={<button> Search </button>}>
        <Search
          query={
            query || Object.fromEntries(new URLSearchParams(search).entries())
          }
        />
      </Bubble>

      {restaurants?.length ? (
        <Gallery {...{ total, ...links, ...data }}>
          {restaurants.map((restaurant, i) => (
            <RestaurantCard {...restaurant} key={i} />
          ))}
        </Gallery>
      ) : restaurants ? (
        <p className="loading">Sorry, no restaurants</p>
      ) : (
        <p className="loading">Loading...</p>
      )}
    </div>
  );
}
