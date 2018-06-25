//@ts-check
// external modules
const passport = require("passport")

const authOptions = {
  session: false,
}

import EmailCreator from "../../../models/email-creator/email-creator"
import EmailSender from "../../../models/emailsender/abstraction"
import UserActions from "../../../models/user-actions/user-actions"

export function start({
  app,
  emailCreator,
  emailSender,
  userActions,
  frontend,
}: {
  app
  emailCreator: EmailCreator
  emailSender: EmailSender
  userActions: UserActions
  frontend
}) {
  app.post("/auth/login", passport.authenticate("local", authOptions), login)
  app.post("/auth/logout", passport.authenticate("jwt", authOptions), logout)
  app.get("/auth/confirm-email", confirmEmail, login)
  app.get("/auth/confirm-email-update", confirmEmailUpdate)
  app.post("/auth/forgot-password", forgotPassword)
  app.post("/auth/reset-password", resetPassword, login)

  app.get(
    "/auth/resend-email",
    passport.authenticate("jwt", authOptions),
    resendEmail,
  )

  app.get(
    ["/auth/google", "/auth/google/callback"],
    passport.authenticate("google", authOptions),
    login,
  )

  app.get(
    ["/auth/linkedin", "/auth/linkedin/callback"],
    passport.authenticate("linkedin", authOptions),
    login,
  )

  app.get(
    ["/auth/facebook", "/auth/facebook/callback"],
    passport.authenticate("facebook", authOptions),
    login,
  )

  async function resendEmail(req, res, next) {
    try {
      let _user = req.user
      let token = await userActions.login(_user.id)
      await emailCreator.confirmEmail(_user, token)
      res.json({ user: _user, token })
    } catch (e) {
      next(e)
    }
  }

  async function login(req, res, next) {
    try {
      let _user = req.user
      let token = await userActions.login(_user.id)
      res.cookie("token", token)
      if (_user.provider) {
        res.redirect(frontend)
      } else {
        res.json({ user: _user, token })
      }
    } catch (e) {
      next(e)
    }
  }

  async function logout(req, res) {
    res.cookie("token", null)
    res.json({ logout: "success" })
  }

  async function confirmEmail(req, res, next) {
    try {
      let { token } = req.query
      let _user = await userActions.confirmEmail(token)
      if (_user) {
        req.user = _user
        next()
      } else {
        res.status(404).json({
          path: "confirmMail",
          error: "Not Found",
        })
      }
    } catch (e) {
      next(e)
    }
  }

  async function confirmEmailUpdate(req, res, next) {
    try {
      let { token } = req.query
      await userActions.confirmEmailUpdate(token)
      res.json({ ok: true })
    } catch (e) {
      next(e)
    }
  }

  async function forgotPassword(req, res, next) {
    try {
      let { email } = req.body
      await userActions.forgotPassword(email)
      res.json({ ok: true })
    } catch (e) {
      next(e)
    }
  }

  async function resetPassword(req, res, next) {
    try {
      let { token, password } = req.body
      let _user = await userActions.resetPassword(token, password)
      if (_user) {
        req.user = _user
        next()
      } else {
        res.status(404).json({
          path: "resetPass",
          error: "Not Found",
        })
      }
    } catch (e) {
      next(e)
    }
  }
}
