import jsonwebtoken from "jsonwebtoken"
import config from "../config.js"
import hashPassword from "../db/hashPassword.js"
import UserModel from "../db/models/UserModel.js"
import validate from "../middlewares/validate.js"
import {
  displayNameValidator,
  emailValidator,
  passwordValidator,
  stringValidator,
} from "../validators.js"

const prepareSignRoutes = ({ app, db }) => {
  app.post(
    "/sign-up",
    validate({
      body: {
        displayName: displayNameValidator,
        email: emailValidator.required(),
        password: passwordValidator.required(),
      },
    }),
    async (req, res) => {
      const { email, password, displayName } = req.locals.body
      const user = await UserModel.query().findOne({ email })

      if (user) {
        res.send({ result: "OK" })

        return
      }

      const [passwordHash, passwordSalt] = await hashPassword(password)

      await db("users").insert({
        displayName,
        email,
        passwordHash,
        passwordSalt,
      })

      res.send({ result: "OK" })
    }
  )
  app.post(
    "/sign-in",
    validate({
      body: {
        email: emailValidator.required(),
        password: stringValidator.required(),
      },
    }),
    async (req, res) => {
      const { email, password } = req.locals.body
      const [user] = await db("users").where({ email })

      if (!user) {
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const [passwordHash] = await hashPassword(password, user.passwordSalt)

      if (passwordHash !== user.passwordHash) {
        res.status(401).send({ error: "Invalid credentials." })

        return
      }

      const jwt = jsonwebtoken.sign(
        {
          payload: {
            user: {
              id: user.id,
            },
          },
        },
        config.security.jwt.secret,
        config.security.jwt.options
      )

      res.send({ result: jwt })
    }
  )
}

export default prepareSignRoutes
