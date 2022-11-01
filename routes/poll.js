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

//----- Return specified poll
pollRoutes.post("/api/poll", (req, res) => {
  Poll.findById(req.body.id)
  .then(poll => {
    if(poll) {
      res.json({
        success: true,
        poll
      });
    } else {
      res.json({
        success: false,
        message: "Poll not found"
      });
    }
  })
  .catch(err => console.log(err));
});

//----- Update poll votes
pollRoutes.put("/api/poll/vote", (req, res) => {
  Poll.findById(req.body.id)
  .then(poll => {
    // Copy options
    let options = [...poll.options];

    // Update vote
    let updatedOptions = options.map(option => {
      if(option.value === req.body.choice) {
        return {
          value: option.value,
          votes: (option.votes + 1)
        };
      } else {
        return option;
      }
    });

    // Save update
    return Poll.findByIdAndUpdate(req.body.id, {
      options: updatedOptions
    }, {
      new: true
    });
  })
  .then(updatedPoll => {
    res.json({ success: true })
  })
  .catch(err => console.log(err));
});

//----- Add new option for given poll
pollRoutes.put("/api/polls/option", (req, res) => {
  Poll.findByIdAndUpdate(req.body.id, {
    $push: {
      options: {
        value: req.body.newOption,
        votes: 0
      }
    }
  }, {
    new: true
  })
  .then(updatedPoll => {
    res.json({ success: true })
  })
  .catch(err => console.log(err));
});

//----- Return all polls for given user
pollRoutes.post("/api/polls/user", (req, res) => {
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