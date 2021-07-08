import React from "react";
import { Link } from "react-router-dom";

import Gallery from "Gallery";
import ReviewCard from "restaurant/review/Card";

import { useRestaurant } from "services/graphql/restaurants";

export default function Restaurant({ id }) {
  const [
    {
      _id: restaurantId,
      name,
      description = "[no description]",
      cuisine,
      address,
      reviews = [],
    },
  ] = useRestaurant(id);

  if (restaurantId !== id) {
    return <p className="user-info pulse">Loading...</p>;
  }

  return (
    <article>
      <h1>{name}</h1>
      <section>
        <p>{description}</p>
        <dl>
          <dt>Cuisine:</dt>
          <dd>{cuisine}</dd>
          <dt>Address:</dt>
          <dd>{`${address.building} ${address.street}, ${address.zipcode}`}</dd>
        </dl>
      </section>
      <section>
        <h2> Reviews </h2>
        {reviews.length > 0 ? (
          <Gallery>
            {reviews.map((review) => (
              <ReviewCard restaurantId={id} review={review} key={review._id} />
            ))}
          </Gallery>
        ) : (
          <p className="user-info">Be the first to review!</p>
        )}
      </section>
      <aside className="aside-actions">
        <Link to={`/restaurant/${id}/review`}> Add Review </Link>
      </aside>
    </article>
  );
}
