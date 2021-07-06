import { gql } from "@apollo/client";

export const REVIEW_FIELDS = gql`
  fragment ReviewData on Review {
    restaurant_id
    user_id
    name
    date
    text
  }
`;

export const RESTAURANT_FIELDS = gql`
  fragment RestaurantData on Restaurant {
    name
    cuisine
    address {
      building
      street
      zipcode
    }
  }
`;
