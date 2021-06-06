import React from "react";
import { Link } from "react-router-dom";

import Card from "Card";

export default function RestaurantCard({
  id: restaurantId,
  name,
  cuisine,
  address: { building, street, zipcode } = {},
}) {
  const address = `${building} ${street}, ${zipcode}`;

  return (
    <Card
      title={name}
      text={
        <dl>
          <dt>Cuisine:</dt>
          <dd>{cuisine}</dd>
          <dt>Address:</dt>
          <dd>{address}</dd>
        </dl>
      }
      actions={[
        <Link to={`/restaurant/${restaurantId}`}> See Reviews </Link>,
        <a
          href={`https://www.google.com/maps/place/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          {" "}
          View Map{" "}
        </a>,
      ]}
    />
  );
}
