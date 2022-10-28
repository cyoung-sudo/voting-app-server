const express = require("express");
const userRoutes = express.Router();
// Models
const User = require("../models/UserModel");

//----- Return all users
userRoutes.route("/api/users")
.get((req, res) => {
  User.find({})
  .then(users => {
    res.json({
      success: true,
      users
    })
  })
  .catch(err => console.log(err));
});

//----- Return specific user
userRoutes.route("/api/user")
.post((req, res) => {
  User.findById(req.body.id)
  .then(user => {
    res.json({
      success: true,
      user
    })
  })
  .catch(err => console.log(err));
});

module.exports = userRoutes;