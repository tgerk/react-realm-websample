import { gql } from "@apollo/client";
import { RESTAURANT_FIELDS, REVIEW_FIELDS } from "./fragments";

export const GET_CUISINES = gql`
  query {
    cuisines
  }
`;

export const GET_RESTAURANT = gql`
  ${RESTAURANT_FIELDS}
  ${REVIEW_FIELDS}
  query getRestaurant($id: ObjectId) {
    restaurant(query: { _id: $id }) {
      _id
      ...RestaurantData
    }
    reviews(query: { restaurant_id: $id }) {
      _id
      ...ReviewData
    }
  }
`;
