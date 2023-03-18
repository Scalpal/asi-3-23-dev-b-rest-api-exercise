import preparePageRoutes from "./routes/preparePageRoutes.js"
import prepareSignRoutes from "./routes/prepareSignRoutes.js"

const prepareRoutes = (ctx) => {
  prepareSignRoutes(ctx)
  preparePageRoutes(ctx)
}

export default prepareRoutes
