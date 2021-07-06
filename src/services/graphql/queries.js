import { useQuery } from "@apollo/client";
import { GET_CUISINES, GET_RESTAURANT } from "./gql/query";

export function useCuisines() {
  const { loading, error = {}, data: { cuisines = [] } = {} } = useQuery(
    GET_CUISINES
  );

  return [cuisines, loading, error];
}

export function useRestaurant(id) {
  const {
    loading,
    error,
    data: { restaurant = {}, reviews = [] } = {},
  } = useQuery(GET_RESTAURANT, { variables: { id } });

  return [{ ...restaurant, reviews }, loading, error];
}
