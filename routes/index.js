const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// require our auth routes files:
const authRouter = require("./auth.routes")
router.use("/auth", authRouter)
// require our private routes files:
const privateRouter = require("./private.routes")
router.use("/private", privateRouter)

module.exports = router;
