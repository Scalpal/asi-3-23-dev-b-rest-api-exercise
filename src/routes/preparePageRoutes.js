import NavigationMenuPagesRelationModel from "../db/models/NavigationMenuPagesRelationModel.js"
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
  // All pages
  app.get(
    "/pages",
    validate({
      query: {
        limit: limitValidator.default(10),
        page: pageValidator,
        orderField: orderFieldValidator(["id","title", "content"]).default("id"),
        order: orderValidator.default("asc"),
      },
    }),

    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.query
      const query = PageModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const pagesQuery = query
        .select("*")
        .where("status", "published")
      
      const pages = await pagesQuery

      const countQuery = await pagesQuery
        .clone()
        .groupBy("id")
        .count()

      const count = countQuery.reduce((acc, { count }) => acc + Number.parseInt(count), 0)

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
        limit: limitValidator.default(1),
        page: pageValidator,
        orderField: orderFieldValidator(["id" ,"title", "content"]).default("id"),
        order: orderValidator.default("asc"),
      },
    }),

    async (req, res) => {
      const { id } = req.locals.session.user 
      
      const { limit, page, orderField, order } = req.locals.query
      const query = PageModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }

      const pagesQuery = query
        .select("*")
        .where("status", "draft")
        .where("creator", id)
      const pages = await pagesQuery

      const countQuery = await query
        .clone()
        .groupBy("id")
        .count()

      const count = countQuery.reduce((acc, { count }) => acc + Number.parseInt(count), 0)

      res.send({
        result: pages,
        meta: {
          count,
        },
      })
    }
  )

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

  app.patch(
    "/pages/:pageId", 
    auth, 
    checkPermissions,
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
      
    await NavigationMenuPagesRelationModel.query().delete().where({
      pageId: req.params.pageId
    })

    await PageModel.query().delete().where({
      id: req.params.pageId,
    })

    res.send({ result: post, message: "Successfully deleted !" })
  })
}

export default preparePageRoutes
