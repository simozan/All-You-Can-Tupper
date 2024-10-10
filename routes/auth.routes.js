const express = require("express");
const router = express.Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Foodpost = require("../models/Foodpost.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

// GET /auth/signup
router.get("/signup", isLoggedOut, (req, res) => {
  let data = {
    layout: false
  }
  res.render("auth/signup", data);
});

// POST /auth/signup
router.post("/signup", isLoggedOut, (req, res) => {
  let data = {
    layout: false
  }
  const { username, email, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || email === "" || password === "") {
    res.status(400).render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });

    return;
  }

  if (password.length < 6) {
    res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 6 characters long.",
    });

    return;
  }

  //   ! This regular expression checks password for special characters and minimum length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(400)
      .render("auth/signup", {
        errorMessage: "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }
  */

  // Create a new user - start by hashing the password
  bcrypt
    .genSalt(saltRounds)
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {
      // Create a user and save it in the database
      return User.create({ username, email, password: hashedPassword });
    })
    .then((user) => {
      res.redirect("/auth/login");
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render("auth/signup", {
          errorMessage:
            "Username and email need to be unique. Provide a valid username or email.",
        });
      } else {
        next(error);
      }
    });
});

// GET /auth/login
router.get("/login", isLoggedOut, (req, res) => {
  let data = {
    layout: false
  }
  res.render("auth/login", data);
});

// POST /auth/login
router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, email, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || email === "" || password === "") {
    res.status(400).render("auth/login", {
      errorMessage:
        "All fields are mandatory. Please provide username, email and password.",
    });

    return;
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 6) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 6 characters long.",
    });
  }

  // Search the database for a user with the email submitted in the form
  User.findOne({ email })
    .then((user) => {
      // If the user isn't found, send an error message that user provided wrong credentials
      if (!user) {
        res
          .status(400)
          .render("auth/login", { errorMessage: "Wrong credentials." });
        return;
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt
        .compare(password, user.password)
        .then((isSamePassword) => {
          if (!isSamePassword) {
            res
              .status(400)
              .render("auth/login", { errorMessage: "Wrong credentials." });
            return;
          }

          // Add the user object to the session object
          req.session.currentUser = user.toObject();
          // Remove the password field
          delete req.session.currentUser.password;

          res.redirect("/auth/feed");
        })
        .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    })
    .catch((err) => next(err));
});

// GET /auth/logout
router.post("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).render("auth/logout", { errorMessage: err.message });
      return;
    }

    res.redirect("/");
  });
});
// Get user infos and display them

router.get("/user-profile", (req, res) => {
  const user = req.session.currentUser
  res.render("auth/user-profile", user);
});

//display page edit user

router.get("/user-edit", (req, res) => {
  const user = req.session.currentUser
  res.render("auth/user-edit", user)
});

// edit user
router.post("/user-edit", (req, res) => {
  const userToUpdate = req.session.currentUser
  //console.log("ciao", userToUpdate);
  const updatedUser = req.body;
  //console.log("hello", updatedUser);
  User.findByIdAndUpdate(userToUpdate._id, { bio: updatedUser.bio }, { new: true })
    .then((userUpdated) => {
      console.log(userUpdated);
      res.render("auth/user-profile", userUpdated)
    })
    .catch((error) => console.log("error!!", error));

})

// GET /auth/feed
router.get("/feed", (req, res) => {
  Foodpost.find()
    .then(allthepostfromDB => {
      console.log('>>>>> THIS IS YOU GET FROM THE DB :', allthepostfromDB);
      res.render("auth/feed", { posts: allthepostfromDB });
    })
    .catch(error => {
      console.log("error!!", error);
    });
});

// GET /auth/post-create
router.get("/post-create", (req, res) => {

  res.render("auth/post-create");

});

router.post("/post-create", (req, res) => {
  const user = req.session.currentUser
  const { title, foodImage, description, expiringDate, pickUpTime, pickUpPlace, foodType, alergies } = req.body; /// from the form

  console.log("this is the req.body", req.body)
  Foodpost.create(req.body)  //This already updates the Mongo database
    .then((newFoodPost) => {
    
      return User.findByIdAndUpdate(user.id, { $push: { foodPosts: newFoodPost._id } })  //return s
    })
    .then((userUpdated) => {
      console.log(userUpdated)
      res.redirect("/auth/feed");   //slash needed wehn redirecting
    })
});

// GET /auth/post-edit
router.get("/post-edit", (req, res) => {
  res.render("auth/post-edit");
});


// GET /auth/post
router.get("/post", (req, res) => {
  res.render("auth/post");
});


module.exports = router;
