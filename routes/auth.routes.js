// require and use express:
const express = require('express');
const router = express.Router();

// require our model:
const User = require("../models/User.model")

// require bcryptjs:
const bcrypt = require("bcryptjs")

//* ROUTES:
// GET "/auth/signup" => Renders a view with a signup form:
router.get("/signup", (req, res, next) => {
    res.render("auth/signup.hbs")
})

// POST "/auth/signup" => Creates the user in the DB:
router.post("/signup", async (req, res, next) => {
    // console.log(req.body);
    // Let's destructure our req.body:
    const {username, password} = req.body

    //* Server validation:
    // Check if the username and password fields are not empty:
    if (username === "" || password === "") {
        // console.log("Username or password are empty");
        // If any field is empty, render the same page but with an error:
        res.render("auth/signup.hbs", {
            errorMessage: "The username and password are mandatory"
        })
        // We also need to stop the route:
        return;
    }
    // Password validation with Regular Expressions:
    const regexPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    if (regexPattern.test(password) === false) {
        res.render("auth/signup.hbs", {
            errorMessage: "Your password is not strong enough. You need at least 8 characters, 1 capital letter, 1 lowercase letter, 1 special character and 1 numeric character."
        })
        return;
    }
    // Async validations:
    try {
        // Check if username is already used:
        const foundUser = await User.findOne({username: username})
        if(foundUser !== null) {
            res.render("auth/signup.hbs", {
                errorMessage: "Username alredy in use."
            })
            return;
        }
        // Let's encrypt the password with bcrypt and salt:
        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password, salt);
        // console.log(hashPassword);

        // After all validations, we can create our user in the DB:
        await User.create({
            username: username,
            password: hashPassword
        })

        // And redirect to the login page:
        res.redirect("/auth/login")
    }
    catch(err){
        next(err)
    }
 })

// GET "/auth/login" => Renders a view with a login form:
router.get("/login", (req, res, next) => {
    res.render("auth/login.hbs")
})

// POST "/auth/login" => Allows access to the user:
router.post("/login", async (req, res, next) => {
    // console.log(req.body);
    // Let's destructure req.body:
    const {username, password} = req.body;

    // Check if all fields are not empty:
    if (username === "" || password === "") {
        res.render("auth/login.hbs", {
            errorMessage: "Username and password are mandatory to login."
        })
        return;
    }

    try {
        // Check if the user exists in our DB:
        const foundUser = await User.findOne({username: username})
        if(foundUser === null) {
            res.render("auth/login.hbs", {
                errorMessage: "User does not exist"
            })
            return;
        }

        // Check that the password is correct:
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
        // console.log(isPasswordCorrect);
        if (isPasswordCorrect === false) {
            res.render("auth/login.hbs", {
                errorMessage: "Password is not correct.",
                // In case we found the user but the password is incorrect, we can send the foundUser object so we render the username on the first form field
                foundUser
            })
            return;
        }

        // After the user has authentication passed, let's create the session:
        req.session.user = foundUser;

        // If the session is correctly saved, we can redirect the user to a private page:
        req.session.save(() => {
            res.redirect("/private/main")
        })


    } catch (error) {
        next(error)
    }
})

// GET "auth/logout" => Close (destroy) the active session:
router.get("/logout", (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/");
    })
})


// export the routes:
module.exports = router;