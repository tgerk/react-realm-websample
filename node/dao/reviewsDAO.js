import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID

export default async (db) => {
  const reviews = await db.collection("reviews")

  return {
    async addReview(restaurantId, user, review, date) {
      const reviewDoc = {
        name: user.name,
        user_id: user._id,
        date: date,
        text: review,
        restaurant_id: ObjectId(restaurantId),
      }

      try {
        const insertResponse = await reviews.insertOne(reviewDoc)

        return insertResponse
      } catch (e) {
        console.error(`Unable to post review: ${e}`)
        return { error: e }
      }
    },

    async updateReview(reviewId, userId, text, date) {
      try {
        const updateResponse = await reviews.updateOne(
          { user_id: userId, _id: ObjectId(reviewId) },
          { $set: { text: text, date: date } }
        )

        return updateResponse
      } catch (e) {
        console.error(`Unable to update review: ${e}`)
        return { error: e }
      }
    },

    async deleteReview(reviewId, userId) {
      try {
        const deleteResponse = await reviews.deleteOne({
          _id: ObjectId(reviewId),
          user_id: userId,
        })

        return deleteResponse
      } catch (e) {
        console.error(`Unable to delete review: ${e}`)
        return { error: e }
      }
    },
  }
}
