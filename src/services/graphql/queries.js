import { gql } from "@apollo/client";

export const CUISINES_QUERY = gql`
  query {
    cuisines
  }
`;

export const RESTAURANT_QUERY = gql`
  query restaurant($id: ObjectId) {
  restaurant(query: {_id: $id}) {
    _id
    name
    cuisine
    address {
      building
      street
      zipcode
    }
  }
  reviews(query: {restaurant_id: {_id: $id}}) {
    text
    date
    name
    user_id
  }
}
`;
