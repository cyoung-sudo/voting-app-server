const mongoose = require("mongoose");
const uri = process.env.ATLAS_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

module.exports = {
  connect: () => {
    mongoose.connect(uri, options)
    .then(() => { 
      console.log("Successfully connected to MongoDB.");
    })
    .catch(err => { 
      console.log(err);
    })
  }
};