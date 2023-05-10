// require and use express:
const express = require('express');
const router = express.Router();

// require and destructure the middleware:
const {isLoggedIn} = require("../middlewares/auth.middlewares")

// GET "private/main" => Render main private page, if logged in:
router.get("/main", isLoggedIn, (req, res, next) => {
    // console.log("User that makes the server call: ", req.session.user);
    res.render("private/main.hbs")
})

// GET "private/private" => Render second private page, if logged in:
router.get("/private", isLoggedIn, (req, res, next) => {
    res.render("private/private.hbs")
})

// export the routes:
module.exports = router;