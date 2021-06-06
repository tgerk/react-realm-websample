export async function apiGetRestaurants(req, res, next) {
  const { restaurants } = req.app.get("state")

  const restaurantsPerPage = req.query.restaurantsPerPage
    ? parseInt(req.query.restaurantsPerPage, 10)
    : 20
  const page = req.query.page ? parseInt(req.query.page, 10) : 0

  let filters = {}
  if (req.query.cuisine) {
    filters.cuisine = req.query.cuisine
  }
  if (req.query.zipcode) {
    filters.zipcode = req.query.zipcode
  }
  if (req.query.name) {
    filters.name = req.query.name
  }

  const {
    restaurantsList,
    totalNumRestaurants,
  } = await restaurants.getRestaurants({
    filters,
    page,
    restaurantsPerPage,
  })

  let response = {
    restaurants: restaurantsList,
    page: page,
    filters: filters,
    entries_per_page: restaurantsPerPage,
    entries_this_page: restaurantsList.length,
    total_results: totalNumRestaurants,
  }

  if (page > 0) response.prev = `${req.baseUrl}${req.path}?page=${page - 1}`
  if (page * restaurantsPerPage < totalNumRestaurants - restaurantsPerPage) {
    response.next = `${req.baseUrl}${req.path}?page=${page + 1}`
  }

  res.json(response)
}

export async function apiGetRestaurantById(req, res, next) {
  const { restaurants } = req.app.get("state")

  let id = req.params.id || {}
  let restaurant = await restaurants.getRestaurantByID(id)
  if (!restaurant) {
    res.status(404).json({ error: "Not found" })
    return
  }

  res.json(restaurant)
}

export async function apiGetRestaurantCuisines(req, res, next) {
  const { restaurants } = req.app.get("state")

  let cuisines = await restaurants.getCuisines()
  res.json(cuisines)
}
