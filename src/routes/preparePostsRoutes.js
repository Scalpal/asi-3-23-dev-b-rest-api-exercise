import PostModel from "../db/models/PostModel.js"
import auth from "../middlewares/auth.js"
import validate from "../middlewares/validate.js"
import {
  boolValidator,
  contentValidator,
  idValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
  titleValidator,
} from "../validators.js"

const preparePostsRoutes = ({ app }) => {
  app.post(
    "/posts",
    auth,
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
      },
    }),
    async (req, res) => {
      const {
        body: { title, content },
        session: {
          user: { id: userId },
        },
      } = req.locals
      const post = await PostModel.query()
        .insert({
          title,
          content,
          userId,
        })
        .returning("*")

      res.send({ result: post })
    }
  )

  app.get(
    "/posts",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["title", "content"]).default("title"),
        order: orderValidator.default("desc"),
        isPublished: boolValidator.default(true),
      },
    }),
    async (req, res) => {
      const { limit, page, orderField, order, isPublished } = req.locals.query
      const query = PostModel.query().modify("paginate", limit, page)

      if (isPublished) {
        query.whereNotNull("publishedAt")
      }

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()
      const count = Number.parseInt(countResult.count, 10)
      const posts = await query.withGraphFetched("author")

      res.send({
        result: posts,
        meta: {
          count,
        },
      })
    }
  )

  app.get(
    "/posts/:postId",
    validate({
      params: {
        postId: idValidator.required(),
      },
    }),
    async (req, res) => {
      const post = await PostModel.query().findById(req.params.postId)

      if (!post) {
        res.status(404).send({ error: "not found" })

        return
      }

      res.send({ result: post })
    }
  )

  app.patch("/posts/:postId", async (req, res) => {
    const { title, content, published } = req.body
    const post = await PostModel.query().findById(req.params.postId)

    if (!post) {
      res.status(404).send({ error: "not found" })

      return
    }

    const updatedPost = await PostModel.query()
      .update({
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(published ? { published } : {}),
      })
      .where({
        id: req.params.postId,
      })
      .returning("*")

    res.send({ result: updatedPost })
  })

  app.delete("/posts/:postId", async (req, res) => {
    const post = await PostModel.query().findById(req.params.postId)

    if (!post) {
      res.status(404).send({ error: "not found" })

      return
    }

    await PostModel.query().delete().where({
      id: req.params.postId,
    })

    res.send({ result: post })
  })
}

export default preparePostsRoutes
