const defaults = {
  pageSize: 20,
};

exports = async function (payload, response) {
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
    {
      count: [{ count = 0 } = {}] = [],
      page = [],
    } = await restaurants.aggregate(pipeline(filter, skip, limit)).next(),
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

const outputTransformRestaurant = ({ _id, ...rest }) => ({
  id: _id.toString(),
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

  if (page * size < total) {
    if (page * size < total - size) {
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
