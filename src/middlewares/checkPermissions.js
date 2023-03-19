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

    case "post": {
      perm = "C"

      break
    }
      
    case "patch": {
      perm = "U"

      break
    }
      
    case "delete": {
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
    console.log("jwt :", payload)

    const user = await UserModel.query()
      .select("id", "role")
      .where("id", payload.user.id)
    
    const perms = await PermissionsModel.query()
      .select("permission_key", "permission_value")
      .where("roleId", user.role)
      .groupBy("permission_key", "permission_value")
    
    const permissions = perms.reduce((acc, { permission_key, permission_value }) => {
      acc[permission_key] = permission_value

      return acc
    }, {})

    const method = req.method
    const ressource = req.url.trim().split("/")[1]
    const permissionNeeded = getPermByMethod(method)

    // console.log("method : ", method)
    // console.log("ressource :", ressource)
    // console.log("perms needed :", permissionNeeded)
    // console.log("ressource checked : ", rolePermissions[ressource])
    // console.log("authorized ? : ", rolePermissions[ressource].includes(permissionNeeded))

    if (!permissions[ressource].includes(permissionNeeded)) {
      throw new InvalidAccessError
    }

    next()
  } catch (err) {
    console.log(err)
  } 

  {/*try {
    // const { payload } = jsonwebtoken.verify(jwt, config.security.jwt.secret)
    // console.log("payload : ", payload)
    // req.locals.session = payload
    
    console.log("req : ", req)
    // console.log("res : ",res)

    next()
  } catch (err) {
    if (err instanceof jsonwebtoken.JsonWebTokenError) {
      res.status(403).send({ error: "Forbidden" })

      return
    }

    console.error(err)

    res.status(500).send({ error: "Oops. Something went wrong." })
  }*/}
}

export default checkPermissions
