const express = require("express");
const pollRoutes = express.Router();
// Models
const Poll = require("../models/PollModel");
// Utils
const Format = require("../utils/format");

pollRoutes.route("/api/polls")
//----- Return all polls
.get((req, res) => {
  Poll.find({})
  .then(polls => {
    res.json({
      success: true,
      polls
    })
  })
  .catch(err => console.log(err));
})
//----- Create poll
.post((req, res) => {
  // Format options string
  let formattedOptions = Format.formatOptions(req.body.options);

  // Create new poll
  let newPoll = new Poll({
    userId: req.user._id,
    topic: req.body.topic,
    options: formattedOptions,
    expiration: req.body.expiration
  })

  // Save new poll
  newPoll.save()
  .then(savedPoll => {
    res.json({ success: true })
  })
  .catch(err => console.log(err));
});

//----- Return all polls for given user
pollRoutes.post("/api/polls/user", (req,res) => {
  Poll.find({ userId: req.body.id })
  .then(userPolls => {
    res.json({
      success: true,
      polls: userPolls
    })
  })
  .catch(err => console.log(err));
});

module.exports = pollRoutes;