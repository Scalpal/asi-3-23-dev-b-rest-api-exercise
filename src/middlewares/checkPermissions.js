import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"

const checkPermissions = (req, res, next) => {
  const jwt = req.headers.authorization?.slice(7)

  try {
    console.log("jwt :", jwt)

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
