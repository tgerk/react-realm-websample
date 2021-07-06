import { gql } from "@apollo/client";
import { REVIEW_FIELDS } from "./fragments";

export const ADD_REVIEW = gql`
  ${REVIEW_FIELDS}
  mutation addReview(
    $restaurantId: ObjectId
    $userId: String
    $userName: String
    $date: DateTime
    $text: String
  ) {
    insertOneReview(
      data: {
        restaurant_id: $restaurantId
        user_id: $userId
        name: $userName
        text: $text
        date: $date
      }
    ) {
      _id
      ...ReviewData
    }
  }
`;

export const MODIFY_REVIEW = gql`
  mutation editReview(
    $reviewId: ObjectId
    $restaurantId: ObjectId
    $userId: String
    $userName: String
    $date: DateTime
    $text: String
  ) {
    updateOneReview(
      set: { name: $userName, text: $text, date: $date }
      query: { _id: $reviewId, user_id: $userId, restaurant_id: $restaurantId }
    ) {
      _id
      name
      text
      date
    }
  }
`;

export const REMOVE_REVIEW = gql`
  mutation deleteReview(
    $reviewId: ObjectId
    $restaurantId: ObjectId
    $userId: String
  ) {
    deleteOneReview(
      query: { _id: $reviewId, user_id: $userId, restaurant_id: $restaurantId }
    ) {
      _id
    }
  }
`;
