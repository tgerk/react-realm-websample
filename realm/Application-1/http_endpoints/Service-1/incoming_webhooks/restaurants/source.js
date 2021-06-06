const defaults = {
  pageSize: 20,
};

exports = async function (payload, response) {
  if ("id" in payload.query) {
    // adopt the strategy that each logical collection (in the RESTful web-resource sense) has a single webhook
    // (unfortunately subcollections are not acheivable on Realm; related collections are grouped in a Service)

    // return a single item from the restaurants collection (in the MongoDB sense)
    return getOne(payload, response);
  }

  const pipeline = (query, skip, limit) => [
    {
      $match: query,
    },
    {
      $facet: {
        count: [{ $count: "count" }],
        page: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const limit = // results per page
      parseInt(payload.query.limit) ||
      parseInt(payload.query.size) ||
      defaults.pageSize,
    skip = Math.max(
      // index of first result
      parseInt(payload.query.skip) ||
        (parseInt(payload.query.page) - 1) * limit ||
        0,
      0
    );

  const filter = {},
    query = {};
  if (payload.query.cuisine) {
    filter.cuisine = { $eq: payload.query.cuisine };
    query.cuisine = payload.query.cuisine;
  }
  if (payload.query.zipcode) {
    filter["address.zipcode"] = { $eq: payload.query.zipcode };
    query.zipcode = payload.query.zipcode;
  }
  if (payload.query.text) {
    filter.$text = { $search: payload.query.text };
    query.text = payload.query.text;
  }

  const restaurants = context.services
      .get("mongodb-atlas")
      .db("sample_restaurants")
      .collection("restaurants"),
    { count: [{ count = 0 }] = [{}], page = [] } =
      (await restaurants.aggregate(pipeline(filter, skip, limit)).next()) || {},
    result = {
      count,
      restaurants: page.map(outputTransformRestaurant),
    };

  if (skip % limit) {
    result.skip = skip;
    result.nav = navLinks(count, skip, limit, query);
  } else {
    result.page = 1 + skip / limit;
    result.nav = pageLinks(count, result.page, limit, query);
  }

  response.setStatusCode(200);
  response.setBody(JSON.stringify(result));
};

async function getOne(payload, response) {
  const pipeline = (id) => [
    {
      $match: {
        _id: BSON.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "reviews",
        let: {
          id: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$restaurant_id", "$$id"],
              },
            },
          },
          {
            $sort: {
              date: -1,
            },
          },
        ],
        as: "reviews",
      },
    },
    {
      $addFields: {
        reviews: "$reviews",
      },
    },
  ];

  //TODO: handle uncaught exceptions, error cases 400: invalid id, 404: NOT FOUND
  const restaurants = context.services
      .get("mongodb-atlas")
      .db("sample_restaurants")
      .collection("restaurants"),
    restaurant = await restaurants.aggregate(pipeline(payload.query.id)).next(),
    result = outputTransformRestaurantWithReviews(restaurant);

  response.setStatusCode(200);
  response.setBody(JSON.stringify(result));
}

const outputTransformRestaurant = ({ _id, ...rest }) => ({
  id: _id.toString(),
  ...rest,
});

const outputTransformRestaurantWithReviews = ({
  _id,
  reviews = [],
  ...rest
}) => ({
  id: _id.toString(),
  ...rest,
  reviews: reviews.map(outputTransformReview),
});

const outputTransformReview = ({
  _id,
  restaurant_id,
  user_id,
  date,
  ...rest
}) => ({
  id: _id.toString(),
  restaurantId: restaurant_id.toString(),
  userId: user_id,
  date: new Date(date),
  ...rest,
});

const pageLinks = (total, page, size, query = {}) => {
  const nav = {};

  if (size !== defaults.pageSize) {
    query.size = size;
  }

  if (page > 1) {
    nav.first = `?${new URLSearchParams({ ...query, page: 0 })}`;

    if (page > 2) {
      nav.prev = `?${new URLSearchParams({ ...query, page: page - 1 })}`;
    }
  }

  if ((page - 1) * size < total) {
    if ((page - 1) * size < total - size) {
      nav.next = `?${new URLSearchParams({ ...query, page: page + 1 })}`;
    }

    nav.last = `?${new URLSearchParams({
      ...query,
      page: 1 + Math.floor(total / size),
    })}`;
  }

  return nav;
};

const navLinks = (total, skip, limit, query = {}) => {
  const nav = {};

  if (limit !== defaults.pageSize) {
    query.limit = limit;
  }

  if (skip > 0) {
    nav.first = `?${new URLSearchParams({ ...query })}`;

    if (skip > limit) {
      nav.prev = `?${new URLSearchParams({ ...query, skip: skip - limit })}`;
    }
  }

  if (skip + limit < total) {
    if (skip + limit < total - limit) {
      nav.next = `?${new URLSearchParams({ ...query, skip: skip + limit })}`;
    }

    nav.last = `?${new URLSearchParams({
      ...query,
      skip: skip + Math.floor((total - skip) / limit) * limit,
    })}`;
  }

  return nav;
};
