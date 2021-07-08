import { useQuery } from "@apollo/client";
import { GET_CUISINES, GET_RESTAURANT } from "./gql/query";

export function useCuisines() {
  const {
    loading,
    error = {},
    data: { cuisines = [] } = {},
  } = useQuery(GET_CUISINES);

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

// TODO: export paginated query for restaurants search
// complicated by separation of search control-panel from results display:  do I need another context?!
// Split into a two-part relay: setting search params and retrieving the search results
// I had a nice de-bouncing scheme, I suppose that can work on either part of the relay
// Paging never really belonged in the search panel anyway, maybe move that to Gallery?
