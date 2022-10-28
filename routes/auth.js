const express = require("express");
const authRoutes = express.Router();
// Models
const User = require("../models/UserModel");
// Authentication
const passport = require("passport");
// Encryption
const bcrypt = require("bcryptjs");

//----- Register new user
authRoutes.post("/api/auth/signup", async (req, res) => {
  // Encrypt password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if(err) console.log(err);

      // Create new user
      let newUser = new User({
        username: req.body.username,
        password: hash
      });

      // Save new user
      newUser.save()
      .then(savedUser => {
        res.json({ success: true });
      })
      .catch(err => {
        console.log(err);
        res.json({
          success: false,
          message: "Username is already taken"
        });
      });
    });
  });
});

//----- Login existing user
// Passes value to "serializeUser()" through next()
authRoutes.post("/api/auth/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if(err) next(err);

    if(!user) {
      // Invalid login
      res.json({
        success: false,
        message: info.message
      });
    } 
    if(user) {
      // Successful login
      req.logIn(user, err => {
        if(err) next(err);
        res.json({
          success: true,
          user
        });
      });
    }
  })(req, res, next);
});

//----- Logout user
authRoutes.post("/api/auth/logout", (req, res) => {
  req.logout(err => {
    if(err) console.log(err);
    res.json({ success: true });
  });
});

//----- Return session status
authRoutes.get("/api/auth/sessionStatus", (req, res) => {
  // Check for valid session
  if(req.user) {
    res.json({
      success: true,
      user: req.user
    });
  } else {
    res.json({
      success: false,
      message: "No session found"
    });
  }
});

module.exports = authRoutes;