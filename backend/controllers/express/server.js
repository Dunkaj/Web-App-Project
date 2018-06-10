// External Modules
const express = require("express")
const bodyParser = require("body-parser")
const passport = require("passport")
const multer = require("multer")
const url = require("url")
const cookieParser = require("cookie-parser")

// Internal Modules
const config = require("../../config")
const router = require("./router")
const strategies = require("./passport-strategies")
const upload = multer({ dest: "../../uploads/" })
const http = require("http")
const io = require("./io/io")
const app = express()

var httpServer = http.createServer(app)
io.connectToHTTP(httpServer)
app.use(bodyParser.json())
app.use(cookieParser())

if (config.env === "development") {
  console.log("Allowing orphan SSL certificates")
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}
// console.log("Allowing cross-origin requests")
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    url.parse(config.frontend).protocol + "//" + url.parse(config.frontend).host
  )
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Credentials", true)
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )
  next()
})

app.use("/", router)

app.use(passport.initialize())
passport.use(strategies.localStrategy)
passport.use(strategies.jwtStrategy)
passport.use(strategies.googleStrategy)
// passport.use(strategies.facebookStrategy);
passport.use(strategies.linkedInStrategy)

// respond with json body for 404 status
app.use((req, res, next) => {
  res.status(404).json({
    path: "General",
    error: "Not Found"
  })
})

// custom error handler
app.use((err, req, res, next) => {
  // customize Joi validation errors
  if (err.isJoi) {
    err.message = err.details.map(e => e.message).join("; ")
    err.status = 400
  }

  // respond with json body
  res.status(err.status || 500).json({
    error: err.message
  })
  next(err)
})

module.exports = httpServer.listen(config.app.port, () => {
  if (config.env == "test") return
  console.log("listening on *:" + config.app.port)
})
