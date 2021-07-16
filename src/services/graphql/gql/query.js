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

// the auto-generated graphql schema does not:
//  provide an offset or cursor parameter (only limit)
//  support {$text: { $search: "stuff"}} text searches
// therefore, I'm going to leave this here (unused) and move RTF on
export const GET_RESTAURANTS = gql`
  ${RESTAURANT_FIELDS}
  query getRestaurants($limit: Int, $cuisines: [String], $zipcodes: [String]) {
  restaurants(limit: $limit, query: { address: { zipcode_in: $zipcodes}, cuisine_in: $cuisines}, sortBy: RESTAURANT_ID_DESC) {
    ...RestaurantData
  }
}`;
