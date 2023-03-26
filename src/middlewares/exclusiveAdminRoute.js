import { NotFoundError } from "objection"
import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError } from "../errors.js"

const exclusiveAdminRoute = async (req, res, next) => {
  const roleAdminId = 2

  try {
    const { id } = req.locals.session.user
    const connectedUser = await UserModel.query().findById(id)
    // console.log("connectedUser :", connectedUser)

    if (!connectedUser) {
      res.status(404).send({ error: "Not found" })

      throw new NotFoundError
    }

    if (connectedUser.roleId !== roleAdminId) {   
      res.status(403).send({ error: "Forbidden" })

      throw new InvalidAccessError
    }

    next()
  } catch (err) {
    console.log(err)
  }
}

export default exclusiveAdminRoute

