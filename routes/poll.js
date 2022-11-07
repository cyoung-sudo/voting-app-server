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
      polls: polls.reverse()
    })
  })
  .catch(err => console.log(err));
})
//----- Create poll
.post((req, res) => {
  // Check for valid session
  if(req.user) {
    // Format options string
    let formattedOptions = Format.formatOptions(req.body.options);

    // Create new poll
    let newPoll = new Poll({
      userId: req.user._id,
      topic: req.body.topic,
      options: formattedOptions,
    })

    // Save new poll
    newPoll.save()
    .then(savedPoll => {
      res.json({ success: true })
    })
    .catch(err => console.log(err));
  } else {
    res.json({
      success: false,
      message: "Session has expired"
    })
  }
});

//----- Return all polls for given user
pollRoutes.post("/api/polls/user", (req, res) => {
  Poll.find({ userId: req.body.id })
  .then(userPolls => {
    res.json({
      success: true,
      polls: userPolls.reverse()
    })
  })
  .catch(err => console.log(err));
});

pollRoutes.route("/api/poll")
//----- Return specified poll
.post((req, res) => {
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
})
//----- Delete specified poll
.delete((req, res) => {
  // Check for valid session
  if(req.user) {
    Poll.findByIdAndDelete(req.body.id)
    .then(deletedPoll => {
      res.json({ success: true });
    })
    .catch(err => console.log(err));
  } else {
    res.json({
      success: false,
      message: "Session has expired"
    })
  }
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
pollRoutes.put("/api/poll/option", (req, res) => {
  // Check for valid session
  if(req.user) {
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
  } else {
    res.json({
      success: false,
      message: "Session has expired"
    })
  }
});

//----- Change poll status
pollRoutes.put("/api/poll/status", (req, res) => {
  // Check for valid session
  if(req.user) {
    let updatedClosed = (req.body.status === "close" ? true : false);
    Poll.findByIdAndUpdate(req.body.id, {
      closed: updatedClosed
    }, {
      new: true
    })
    .then(updatedPoll => {
      res.json({ success: true })
    })
    .catch(err => console.log(err));
  } else {
    res.json({
      success: false,
      message: "Session has expired"
    })
  }
});

module.exports = pollRoutes;