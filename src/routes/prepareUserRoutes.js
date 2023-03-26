import hashPassword from "../db/hashPassword.js"
import NavigationMenuPagesRelationModel from "../db/models/NavigationMenuPagesRelationModel.js"
import PageModel from "../db/models/PageModel.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import checkPermissions from "../middlewares/checkPermissions.js"
import exclusiveAdminRoute from "../middlewares/exclusiveAdminRoute.js"
import validate from "../middlewares/validate.js"
import {
  roleValidator,
  emailValidator,
  firstNameValidator,
  lastNameValidator,
  passwordValidator,
  limitValidator,
  pageValidator,
  orderFieldValidator,
  orderValidator
} from "../validators.js"

const prepareUserRoutes = ({ app, db }) => {
  app.get(
    "/users",
    auth,
    checkPermissions,
    exclusiveAdminRoute,
    validate({
      query: {
        limit: limitValidator,
        page: pageValidator,
        orderField: orderFieldValidator(["id" ,"firstName", "lastName"]).default("id"),
        order: orderValidator.default("asc"),
      },
    }),
    
    async (req, res) => {
      const { limit, page, orderField, order } = req.locals.query
      const query = UserModel.query().modify("paginate", limit, page)

      if (orderField) {
        query.orderBy(orderField, order)
      }
      
      const usersQuery = query.select("*")
      const users = await usersQuery
      
      const countQuery = await usersQuery
        .clone()
        .groupBy("id")
        .count()

      const count = countQuery.reduce((acc, { count }) => acc + Number.parseInt(count), 0)
      
      res.send({ result: users, meta: count })
    }
  )

  // Logged user infos
  app.get(
    "/users/profile",
    auth,
    checkPermissions,
    async (req, res) => {
      const { id } = req.locals.session.user

      const user = await UserModel.query().findById(id)

      if (!user) {
        res.status(404).send({ error: "User not found" })

        return
      } 

      res.send({ result: user })
    }
  )

  app.get(
    "/users/:userId",
    auth,
    checkPermissions,
    exclusiveAdminRoute,

    async (req, res) => {
      const userId = req.params.userId

      const user = await UserModel.query().findById(userId)
      
      if (!user) {
        res.status(404).send({ error: "User not found" })

        return
      } 

      res.send({ result: user })
    }
  )

  app.post(
    "/users/add",
    auth, 
    checkPermissions,
    validate({
      body: {
        firstName: firstNameValidator.required(),
        lastName: lastNameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
        roleId: roleValidator.required()
      },
    }),
    async (req, res) => {
      const { firstName, lastName, email, password, roleId } = req.locals.body
      const user = await UserModel.query().findOne({ email })

      if (user) {
        res.send({ result: "OK" })

        return
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      await db("users").insert({
        firstName,
        lastName,
        email,
        passwordHash,
        passwordSalt,
        roleId
      })

      res.send({ result: "OK" })
    }
  )

  app.patch(
    "/users",
    auth,
    checkPermissions,
    validate({
      body: {
        email: emailValidator,
        firstName: firstNameValidator,
        lastName: lastNameValidator,
        roleId: roleValidator
      }
    }), 
    async (req, res) => {
      const { email, firstName, lastName, roleId } = req.locals.body
      const { id } = req.locals.session.user

      const updatedUser = await UserModel.query()
        .patch({
          ...(email ? { email } : {}),
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(roleId ? { roleId } : {}),
        })
        .where("id", id)
        .returning(["id","email", "firstName", "lastName","roleId"])
      
      res.send({ result: updatedUser, message: "Updated successfully !" })
    }
  )

  app.patch(
    "/users/:userId",
    auth,
    checkPermissions,
    exclusiveAdminRoute,
    validate({
      body: {
        email: emailValidator,
        firstName: firstNameValidator,
        lastName: lastNameValidator,
        roleId: roleValidator
      }
    }), 
    async (req, res) => {
      const { email, firstName, lastName, roleId } = req.locals.body
      const userId = req.params.userId

      const updatedUser = await UserModel.query()
        .patch({
          ...(email ? { email } : {}),
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(roleId ? { roleId } : {}),
        })
        .where("id", userId)
        .returning(["id","email", "firstName", "lastName","roleId"])
      
      res.send({ result: updatedUser, message: "Updated successfully !" })
    }
  )

  // manque delete de toutes les pages qu'il a faite
  app.delete(
    "/users/:userId",
    auth,
    checkPermissions,
    async (req, res) => {
      const user = await UserModel.query().findById(req.params.userId)
      
      if (!user) {
        res.status(404).send({ error: "Not found" })

        return
      } 

      const pagesIds = await PageModel.query().select("id").where("creator", req.params.userId)
      
      for (let i = 0; i < pagesIds.length; i++) {
        const { id } = pagesIds[i]
        await NavigationMenuPagesRelationModel.query().delete().where("pageId", id)
        await PageModel.query().delete().where("id", id)
      }

      const deletedUser = await UserModel.query()
        .delete()
        .where("id", req.params.userId)
        .returning(["id","email", "firstName", "lastName","roleId"])
      
      res.send({ result: deletedUser, message: "Deleted successfully" })
    }
  )
}

export default prepareUserRoutes