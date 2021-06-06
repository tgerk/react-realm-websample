import server from "./api/index.js"
import state from "./dao/index.js"

const port = process.env.PORT || 8000

server(state).then((app) => {
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
})
