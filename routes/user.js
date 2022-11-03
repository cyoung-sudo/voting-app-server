const express = require("express");
const userRoutes = express.Router();
// Models
const User = require("../models/UserModel");
const Poll = require("../models/PollModel");

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

userRoutes.route("/api/user")
//----- Return specific user
.post((req, res) => {
  User.findById(req.body.id)
  .then(user => {
    res.json({
      success: true,
      user
    })
  })
  .catch(err => console.log(err));
})
//----- Delete specific user & related polls
.delete((req, res) => {
  User.findByIdAndDelete(req.user._id)
  .then(deletedUser => {
    return Poll.deleteMany({ userId: deletedUser._id });
  })
  .then(deleteCount => {
    res.json({ success: true });
  })
  .catch(err => console.log(err));
});

module.exports = userRoutes;