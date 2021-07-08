import React, { useState } from "react";

import { useRealm } from "services/realm";
import { useAddEditReview } from "services/graphql/reviews";

export default function Review({ restaurantId, review = {}, history }) {
  const { _id: reviewId, text: initialText } = review,
    [reviewText, setReviewText] = useState(initialText),
    [{ user }] = useRealm(),
    [addEditReview] = useAddEditReview(user, restaurantId, reviewId);

  function saveReview(event) {
    event.preventDefault();
    addEditReview(reviewText);
    history.push(`/restaurant/${restaurantId}`);
  }

  if (!user || user.providerType === "anon-user") {
    return <p className="user-info">Sorry! Log-in to leave a review.</p>;
  }

  return (
    <form className="restaurant-review" onSubmit={saveReview}>
      <div>
        <label htmlFor="description">
          {reviewId ? "Update" : "Create"} Review
        </label>
        <input
          id="text"
          name="text"
          type="text"
          value={reviewText || ""}
          placeholder="Your review"
          onChange={({ target: { value } }) => setReviewText(value)}
          required
        />
      </div>
      <button name="submit" onClick={saveReview}>
        Submit
      </button>
    </form>
  );
}
