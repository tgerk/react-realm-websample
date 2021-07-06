import { useMutation } from "@apollo/client";
import { ADD_REVIEW, MODIFY_REVIEW, REMOVE_REVIEW } from "./gql/mutation";
import { GET_RESTAURANT } from "./gql/query";

export function useAddEditReview(user, restaurantId, reviewId) {
  const [addReview, addResult] = useMutation(ADD_REVIEW, {
      update: addReviewToRestaurantQuery,
      refetchQueries: [
        { query: GET_RESTAURANT, variables: { id: restaurantId } },
      ],
    }),
    [editReview, editResult] = useMutation(MODIFY_REVIEW, {
      // no update function:  simply modifying one existing entity (fragment in cache)
      refetchQueries: [
        { query: GET_RESTAURANT, variables: { id: restaurantId } },
      ],
    });

  if (user) {
    const variables = {
      restaurantId,
      userId: user.id,
      userName: user.profile?.name || user.profile?.email,
      date: new Date(),
    };
    return reviewId
      ? [
          (text) =>
            editReview({
              variables: { reviewId, ...variables, text },
              optimisticResponse: {
                updateOneReview: {
                  __typename: "Review",
                  _id: reviewId,
                  name: variables.userName,
                  date: variables.date,
                  text,
                },
              },
            }),
          editResult,
        ]
      : [
          (text) =>
            addReview({
              variables: { ...variables, text },
              optimisticResponse: {
                insertOneReview: {
                  __typename: "Review",
                  _id: -1,
                  restaurant_id: restaurantId,
                  user_id: user.id,
                  name: variables.userName,
                  date: variables.date,
                  text,
                },
              },
            }),
          addResult,
        ];
  }

  // user is required to do a mutation, function and result are undefined if no user is in context
  return [];

  function addReviewToRestaurantQuery(cache, { data: { insertOneReview } }) {
    // add review to result of query getRestaurant:${restaurantId}
    const { restaurant, reviews } = cache.readQuery({
      query: GET_RESTAURANT,
      variables: { id: restaurantId },
    });
    cache.writeQuery({
      query: GET_RESTAURANT,
      variables: { id: restaurantId },
      data: {
        restaurant,
        reviews: [...reviews, { __typename: "Review", ...insertOneReview }],
      },
    });
  }
}

export function useDeleteReview(user, restaurantId, reviewId) {
  // will this remove reference from restaurant?
  const [deleteReview, deleteResult] = useMutation(REMOVE_REVIEW, {
    update: deleteReviewFromRestaurantQuery,
    refetchQueries: [
      { query: GET_RESTAURANT, variables: { id: restaurantId } },
    ],
  });

  if (user) {
    // TODO: and not anon-user!
    return [
      () =>
        deleteReview({
          variables: { reviewId, restaurantId, userId: user.id },
          optimisticResponse: {
            deleteOneReview: { __typename: "Review", _id: reviewId },
          },
        }),
      deleteResult,
    ];
  }

  // user is required to do a mutation, function and result are undefined if no user is in context
  return [];

  function deleteReviewFromRestaurantQuery(
    cache,
    { data: { deleteOneReview } }
  ) {
    // reviews come from a two-part compound query, meaning that the restaurant entitiy in cache does not possess references to reviews
    const { restaurant, reviews } = cache.readQuery({
      query: GET_RESTAURANT,
      variables: { id: restaurantId },
    });
    cache.writeQuery({
      query: GET_RESTAURANT,
      variables: { id: restaurantId },
      data: {
        restaurant,
        reviews: reviews.filter(({ _id }) => _id !== deleteOneReview._id),
      },
    });
  }
}
