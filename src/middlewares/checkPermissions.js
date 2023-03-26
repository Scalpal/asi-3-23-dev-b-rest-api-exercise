import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import PermissionsModel from "../db/models/Permissions.js"
import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError } from "../errors.js"

const getPermByMethod = (method) => {
  let perm = ""

  switch (method) {
    case "GET": {
      perm = "R"

      break
    }

    case "POST": {
      perm = "C"

      break
    }
      
    case "PATCH": {
      perm = "U"

      break
    }
      
    case "DELETE": {
      perm = "D"

      break
    } 
  }

  return perm
}

const checkPermissions = async(req, res, next) => {
  const jwt = req.headers.authorization?.slice(7)

  try {
    const { payload } = jsonwebtoken.verify(jwt, config.security.jwt.secret)

    const user = await UserModel.query()
      .select("id", "roleId")
      .where("id", payload.user.id)
    
    const perms = await PermissionsModel.query()
      .select("permission_key", "permission_value")
      .where("roleId", user[0].roleId)
      .groupBy("permission_key", "permission_value")

    const permissions = perms.reduce((acc, { permission_key, permission_value }) => {
      acc[permission_key] = permission_value

      return acc
    }, {})

    const method = req.method
    const ressourceNoSlashes = req.url.trim().split("/")[1]
    const [ressource] = ressourceNoSlashes.split("?") // ressource completely sanitized from slashes and query params
    const permissionNeeded = getPermByMethod(method)

    if (!permissions[ressource].includes(permissionNeeded)) {
      res.status(403).send({ error: "Forbidden" })

      throw new InvalidAccessError
    }

    next()
  } catch (err) {
    console.log(err)
  } 
}

export default checkPermissions


