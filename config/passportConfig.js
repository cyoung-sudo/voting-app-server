// Authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
// Encryption
const bcrypt = require("bcryptjs");
// Models
const User = require("../models/UserModel");

//----- Authentication strategy
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, async (err, user) => {
    if(err) done(err);

    // Check if user exists
    if(!user) { 
      return done(null, false, { message: "No user found" }); 
    }

    // Validate password
    bcrypt.compare(password, user.password).then((res) => {
      if(res) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password" }); 
      }
    });
  });
}));

//----- Saves user-id as cookie in session
// Stored in "req.session.passport.user"
// Passes value to "deserializeUser()" through done()
passport.serializeUser((user, done) => {
  done(null, user.id)
});

//----- Saves user-obj in request using session-cookie
// Stored in "req.user"
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
     done(err, user);
  });
});