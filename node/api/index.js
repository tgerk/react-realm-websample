import express from "express"
import cors from "cors"

import routes from "./restaurants.route.js"

export default async (state) => {
  const app = express()

  app.use(cors())

  // REST/JSON middleware:
  app.use((req, res, next) => {
    if ((req.method == "GET" || req.method == "DELETE" || req.is("json")) && req.accepts("json")) {
      next()
      return
    }

    res.status(400).json({
      error: "accepts and returns only JSON",
    })
  })

  app.use(express.json())

  app.set("state", await state)
  app.use("/api/v1/restaurants", routes)
  app.use("*", (req, res) => res.status(404).json({ error: "not found" }))
  app.use((e, req, res, next) => {
    console.log(`api, ${e}`)
    res.status(500).json({ error: e.message })
  })

  return app
}
