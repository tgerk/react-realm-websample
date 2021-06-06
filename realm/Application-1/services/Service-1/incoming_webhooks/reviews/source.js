exports = async function (payload, response) {
  switch (context.request.httpMethod) {
    case "POST":
      return onPost(payload, response);
    case "PUT":
      return onPut(payload, response);
    case "DELETE":
      return onDelete(payload, response);
    default:
      // error case 405: method not allowed
      response.setStatusCode(405);
  }
};

async function onPost(payload, response) {
  if (!payload.body) {
    response.setStatusCode(400);
    return;
  }

  const body = EJSON.parse(payload.body.text()),
    doc = {
      restaurant_id: BSON.ObjectId(body.restaurantId),
      user_id: body.userId,
      name: body.name,
      date: new Date(),
      text: body.text,
    };

  const reviews = context.services
      .get("mongodb-atlas")
      .db("sample_restaurants")
      .collection("reviews"),
    { insertedId } = await reviews.insertOne(doc);

  if (!insertedId) {
    response.setStatusCode(400);
    return;
  }

  const review = await reviews.findOne({ _id: insertedId });

  response.setStatusCode(201);
  response.setBody(JSON.stringify(transformReview(review)));
}

async function onPut(payload, response) {
  if (!payload.body) {
    response.setStatusCode(400);
    return;
  }

  const _id = BSON.ObjectId(payload.query.id),
    user_id = payload.query.userId,
    body = EJSON.parse(payload.body.text()),
    updateDoc = {
      $set: {
        name: body.name,
        date: new Date(),
        text: body.text,
      },
    };

  const reviews = context.services
      .get("mongodb-atlas")
      .db("sample_restaurants")
      .collection("reviews"),
    { matchedCount, modifiedCount } = await reviews.updateOne(
      { _id, user_id },
      updateDoc
    );

  if (!matchedCount || !modifiedCount) {
    response.setStatusCode(404);
    return;
  }

  const review = await reviews.findOne({ _id });

  response.setStatusCode(202);
  response.setBody(JSON.stringify(transformReview(review)));
}

async function onDelete(payload, response) {
  const _id = BSON.ObjectId(payload.query.id),
    user_id = payload.query.userId;

  const reviews = context.services
      .get("mongodb-atlas")
      .db("sample_restaurants")
      .collection("reviews"),
    { deletedCount } = await reviews.deleteOne({ _id, user_id });

  if (!deletedCount) {
    response.setStatusCode(404);
    return;
  }

  response.setStatusCode(204);
}

const transformReview = ({ _id, restaurant_id, user_id, date, ...rest }) => ({
  id: _id.toString(),
  restaurantId: restaurant_id.toString(),
  userId: user_id,
  date: new Date(date),
  ...rest,
});
