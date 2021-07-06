import React from "react";
import { Link } from "react-router-dom";
import relativeDate from "relative-date";

import Card from "Card";

import { useRealm } from "services/realm";
import { useDeleteReview } from "services/graphql/mutations";

export default function ReviewCard({ restaurantId, review }) {
  const { _id: reviewId, user_id: userId, name: userName, date, text } = review,
    [{ user }] = useRealm(),
    [deleteReview] = useDeleteReview(user, restaurantId, reviewId);

  const actions = [];
  if (reviewId && userId === user?.id) {
    actions.push(
      <button onClick={deleteReview}> Remove </button>,
      <Link
        to={{
          pathname: `/restaurant/${restaurantId}/review`,
          state: { review },
        }}
      >
        {" "}
        Edit{" "}
      </Link>
    );
  }

  return (
    <Card
      title={userName}
      subtitle={relativeDate(new Date(date))}
      text={<p>{text}</p>}
      actions={actions}
    />
  );
}
