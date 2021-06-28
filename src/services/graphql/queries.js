import { gql } from "@apollo/client";

export const CUISINES_QUERY = gql`
  query {
    cuisines
  }
`;
