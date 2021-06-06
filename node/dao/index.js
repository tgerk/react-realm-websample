import mongodb from "mongodb"
import RestaurantsDAO from "./restaurantsDAO.js"
import ReviewsDAO from "./reviewsDAO.js"

const { RESTREVIEWS_DB_URI: mongoURI, RESTREVIEWS_NS: dbname } = process.env

export default mongodb.MongoClient.connect(mongoURI, {
  poolSize: 50,
  // wtimeout: 2500,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async (conn) => {
    const db = await conn.db(dbname)

    const restaurants = await RestaurantsDAO(db),
      reviews = await ReviewsDAO(db)

    return { restaurants, reviews }
  })
  .catch((err) => {
    console.error(err.stack)
    process.exit(1)
  })
