//----- Imports
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 5000;
const db = require("./db/conn");
// Session
const session = require("express-session");
// Passport
const passport = require("passport");
require("./config/passportConfig");

//----- Middleware
app.use(cors());
app.use(express.json());
// Session (needs to be above passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 } // 1min
}));
// Passport
app.use(passport.initialize());
app.use(passport.session());

//----- Routes
app.use(require("./routes/auth"));
app.use(require("./routes/user"));
app.use(require("./routes/poll"));
 
//----- Connection
app.listen(port, () => {
  db.connect(); // Connect to DB
  console.log(`Server is running on port: ${port}`);
});