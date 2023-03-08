import preparePostsRoutes from "./routes/preparePostsRoutes.js"
import prepareSignRoutes from "./routes/prepareSignRoutes.js"

const prepareRoutes = (ctx) => {
  prepareSignRoutes(ctx)
  preparePostsRoutes(ctx)
}

export default prepareRoutes
