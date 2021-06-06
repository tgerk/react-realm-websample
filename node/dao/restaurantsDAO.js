import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID

export default async function restaurantsDAOFactory(db) {
  const restaurants = await db.collection("restaurants")

  return {
    async getRestaurants({
      filters = null,
      page = 0,
      restaurantsPerPage = 20,
    } = {}) {
      let query = {}
      if (filters) {
        if ("name" in filters) {
          query["$text"] = { $search: filters["name"] }
        }
        if ("cuisine" in filters) {
          query["cuisine"] = { $eq: filters["cuisine"] }
        }
        if ("zipcode" in filters) {
          query["address.zipcode"] = { $eq: filters["zipcode"] }
        }
      }

      // TODO: implement a proxy for cursor; use an ID for the cursor in next/prev links ...but you know what?: that's stupid & a great reason to adopt serverless & MongoDB Realm to outsource that plumbing grunt-work
      let cursor

      try {
        console.debug(query)
        cursor = await restaurants.find(query)
      } catch (e) {
        console.error(`Unable to issue find command, ${e}`)
        return { restaurantsList: [], totalNumRestaurants: 0 }
      }

      const displayCursor = cursor
        .limit(restaurantsPerPage)
        .skip(restaurantsPerPage * page)

      try {
        const restaurantsList = await displayCursor.toArray()
        const totalNumRestaurants = await restaurants.countDocuments(query)

        return { restaurantsList, totalNumRestaurants }
      } catch (e) {
        console.error(
          `Unable to convert cursor to array or problem counting documents, ${e}`
        )
        return { restaurantsList: [], totalNumRestaurants: 0 }
      }
    },

    async getRestaurantByID(id) {
      try {
        const pipeline = [
          {
            $match: {
              _id: new ObjectId(id),
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
        ]
        return await restaurants.aggregate(pipeline).next()
      } catch (e) {
        console.error(`Something went wrong in getRestaurantByID: ${e}`)
        throw e
      }
    },

    async getCuisines() {
      let cuisines = []
      try {
        cuisines = await restaurants.distinct("cuisine")
        return cuisines
      } catch (e) {
        console.error(`Unable to get cuisines, ${e}`)
        return cuisines
      }
    },
  }
}
