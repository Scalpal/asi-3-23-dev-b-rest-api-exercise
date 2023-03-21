import hashPassword from "../db/hashPassword.js"
import UserModel from "../db/models/UserModel.js"
import auth from "../middlewares/auth.js"
import checkPermissions from "../middlewares/checkPermissions.js"
import validate from "../middlewares/validate.js"
import {
  roleValidator,
  emailValidator,
  firstNameValidator,
  lastNameValidator,
  passwordValidator,
} from "../validators.js"


const prepareUserRoutes = ({ app, db }) => {
  app.get(
    "/users",
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
    async (req, res) => {
      const id = req.params.userId

      const user = await UserModel.query().findById(id)

      if (!user) {
        res.status(404).send({ error: "User not found" })

        return
      } 

      res.send({ result: user })
    }
  )

  app.post(
    "/users/add",
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

      const deletedUser = await UserModel.query()
        .delete()
        .where("id", req.params.userId)
        .returning(["id","email", "firstName", "lastName","roleId"])
      
      res.send({ result: deletedUser, message: "Deleted successfully" })
    }
  )
}

export default prepareUserRoutes