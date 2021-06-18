import React, { useContext } from "react";
import { Link } from "react-router-dom";
import relativeDate from "relative-date";

import Card from "Card";

import { UserContext } from "services/user";
import { useRealm } from "services/realm";

export default function ReviewCard({ restaurantId, ...review }) {
  const { id: reviewId, userId, name: userName, date, text } = review,
    [currentUser] = useContext(UserContext),
    [, api] = useRealm();

  function removeReview() {
    api.deleteReview(reviewId, userId, restaurantId);
  }

  const actions = [];
  if (currentUser?.id === userId && reviewId) {
    // possible the review is local only (optimistic update) and does not yet have an id
    actions.push(
      <button onClick={removeReview}> Remove </button>,
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
