import React, { useState, useContext } from "react";

import { UserContext } from "services/user";
import { useRealm } from "services/realm";

export default function Review({
  restaurantId,
  review: { id: reviewId, text: initialText } = {},
  history,
}) {
  const [reviewText, setReviewText] = useState(initialText),
    [currentUser] = useContext(UserContext),
    [, api] = useRealm();

  function saveReview(event) {
    event.preventDefault();

    ((data) =>
      reviewId ? api.updateReview(reviewId, data) : api.createReview(data))({
      restaurantId: restaurantId,
      userId: currentUser.id,
      name: currentUser.name,
      text: reviewText,
    }).catch((e) => {
      console.log(e);
    });

    history.push(`/restaurant/${restaurantId}`);
  }

  if (!currentUser) {
    return (
      <p className="loading">Sorry! Only logged-in users can leave reviews.</p>
    );
  }

  return (
    <form className="review" onSubmit={saveReview}>
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
