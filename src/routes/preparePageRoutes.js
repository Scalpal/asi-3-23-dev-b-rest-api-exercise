import PageModel from "../db/models/PageModel.js"
import auth from "../middlewares/auth.js"
import checkPermissions from "../middlewares/checkPermissions.js"
import validate from "../middlewares/validate.js"
import {
  contentValidator,
  limitValidator,
  orderFieldValidator,
  orderValidator,
  pageValidator,
  titleValidator,
  slugValidator,
  statusValidator
} from "../validators.js"

const preparePageRoutes = ({ app }) => {
  app.post(
    "/pages/add",
    auth,
    checkPermissions,
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        slug: slugValidator.required(),
        status: statusValidator.required(),
      },
    }),

    async (req, res) => {
      const {
        body: { title, content, slug, status },
        session: {
          user: { id: userId },
        },
      } = req.locals

      const page = await PageModel.query()
        .insert({
          title,
          content,
          slug,
          usersWhoModified: `[${userId}]`,
          creator: userId,
          status,
        })
        .returning("*")

      res.send({ result: page })
    }
  )

  // All pages
  app.get(
    "/pages",
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["title", "content"]).default("title"),
        order: orderValidator.default("desc"),
      },
    }),

    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.query
      const query = PageModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const pages = await query
        .select("*")
        .where("status", "published")

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()

      const count = Number.parseInt(countResult.count, 10)

      res.send({
        result: pages,
        meta: {
          count,
        },
      })
    }
  )

  // Only drafts of logged user
  app.get(
    "/pages/drafts",
    auth,
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["title", "content"]).default("title"),
        order: orderValidator.default("desc"),
      },
    }),

    async (req, res) => {
      console.log("session : ", req.locals.session)

      const { id } = req.locals.session.user 
      
      const { limit, page, orderField, order } = req.locals.query
      const query = PageModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const pages = await query
        .select("*")
        .where("status", "draft")
        .where("creator", id)

      const [countResult] = await query
        .clone()
        .clearSelect()
        .clearOrder()
        .count()

      const count = Number.parseInt(countResult.count, 10)

      res.send({
        result: pages,
        meta: {
          count,
        },
      })
    }
  )

  // Get page with it's slug
  app.get(
    "/:slug",
    auth,
    async (req, res) => {
      const page = await PageModel.query()
        .select("*")
        .where("slug", req.params.slug)

      if (page[0].status === "draft") {
        res.status(404).send({ error: "Page not found" })

        return
      }

      res.send({ result: page })
    }
  )

  app.patch(
    "/pages/:pageId", 
    auth, 
    validate({
      body: {
        title: titleValidator.required(),
        content: contentValidator.required(),
        status: statusValidator.required(),
      }
    }),
    async (req, res) => {
    const { title, content, status } = req.body
    const { id } = req.locals.session.user

    const post = await PageModel.query().findById(req.params.pageId)

    console.log("userWhoModified : ", post.usersWhoModified)
    
    if (!post) {
      res.status(404).send({ error: "not found" })

      return
    }

    const updatedPost = await PageModel.query()
      .update({
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        usersWhoModified : (!post.usersWhoModified.includes(id) ? JSON.stringify([...post.usersWhoModified, id]) : JSON.stringify(post.usersWhoModified)),
        ...(status ? { status } : {}),
      })
      .where({
        id: req.params.pageId,
      })
      .returning("*")

    res.send({ result: updatedPost })
  })

  app.delete(
    "/pages/:pageId",
    auth,
    checkPermissions,
    async (req, res) => {
    const post = await PageModel.query().findById(req.params.pageId)

    if (!post) {
      res.status(404).send({ error: "Not found" })

      return
    }

    await PageModel.query().delete().where({
      id: req.params.pageId,
    })

    res.send({ result: post, message: "Successfully deleted !" })
  })
}

export default preparePageRoutes
