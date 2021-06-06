import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import Gallery from "Gallery";
import ReviewCard from "restaurant/review/Card";

import { useRealm } from "services/realm";

export default function Restaurant({ id }) {
  const [
      {
        restaurantsById: { [id]: restaurant = {} },
      },
      api,
    ] = useRealm(),
    {
      id: restaurantId,
      name,
      description = "[no description]",
      cuisine,
      address,
      reviews = [],
    } = restaurant;

  useEffect(() => {
    // I think this is called each time we navigate to the page (because newly-mounted on each navigation by Router/Switch --need confirmation)
    /* console.info(
      `requesting restaurant ${id}` +
        (restaurantId ? `, updating "${name}" already in Realm context` : "")
    ); */
    api.getRestaurant(id).catch((e) => {
      console.log(e);
    });
  }, [id, api]);

  if (restaurantId !== id) {
    return <p className="loading">Loading...</p>;
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
            {reviews.map((review, i) => (
              <ReviewCard restaurantId={id} {...review} key={i} />
            ))}
          </Gallery>
        ) : (
          <p className="loading">Be the first to review!</p>
        )}
      </section>
      <aside>
        <Link to={`/restaurant/${id}/review`} className="btn btn-primary">
          {" "}
          Add Review{" "}
        </Link>
      </aside>
    </article>
  );
}
