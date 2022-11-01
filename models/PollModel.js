var mongoose = require("mongoose");

var PollSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  options: {
    type: [{
      value: String,
      votes: Number
    }],
    required: true
  },
  closed: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Poll", PollSchema);