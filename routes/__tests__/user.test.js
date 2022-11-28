//----- Imports
const mongoose = require("mongoose");
const request = require("supertest");
const express = require("express");
const app = new express();
require("dotenv").config({ path: "./config.env" });
// Session
const session = require("express-session");
// Passport
const passport = require("passport");
require("../../config/passportConfig");

//----- Middleware
app.use(express.json()); // needed to test POST requests
// Session (needs to be above passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//----- Routes
app.use(require("../auth"));
app.use(require("../user"));

describe("----- User Routes -----", () => {
  beforeEach(done => {
    mongoose.connect(process.env.ATLAS_TESTING_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true 
    })
    .then(() => {
      // Clear initial data
      const User = mongoose.model("User");
      return User.deleteMany({})
    })
    .then(() => done());
  });
  
  afterEach(done => {
    // Clear test data
    const User = mongoose.model("User");
    User.deleteMany({})
    .then(() => mongoose.connection.close())
    .then(() => done());
  });

  describe("/api/users", () => {
    //----- Test 1 -----
    it("(GET) successfully retrieves all users", done => {
      request(app)
      .post("/api/auth/signup")
      .send({
        username: "bob",
        password: "pass"
      })
      .end(err => {
        if(err) return done(err);
        request(app)
        .get("/api/users")
        .end((err, res) => {
          if(err) return done(err);
          expect(res.statusCode).toBe(200);
          expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
          expect(res.body.success).toBeDefined();
          expect(res.body.success).toBe(true);
          expect(res.body.users).toBeDefined();
          expect(Array.isArray(res.body.users)).toBe(true);
          expect(res.body.users).toHaveLength(1);
          done();
        });
      });
    });
  });

  describe("/api/user", () => {
    //----- Test 2 -----
    it("(GET) successfully retrieves given user", done => {
      // Create user
      request(app)
      .post("/api/auth/signup")
      .send({
        username: "bob",
        password: "pass"
      })
      .end(err => {
        if(err) return done(err);
        // Retrieve all users
        request(app)
        .get("/api/users")
        .end((err, res) => {
          if(err) return done(err);
          // Retrieve given user
          request(app)
          .post("/api/user")
          .send({
            id: res.body.users[0]._id
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(res.body.success).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.user).toBeDefined();
            done();
          });
        });
      });
    });

    //----- Test 3 -----
    it("(DELETE) successfully deletes given user", done => {
      // Create user
      request(app)
      .post("/api/auth/signup")
      .send({
        username: "bob",
        password: "pass"
      })
      .end(err => {
        if(err) return done(err);
        // Retrieve all users
        request(app)
        .get("/api/users")
        .end((err, res) => {
          if(err) return done(err);
          // Delete user
          request(app)
          .delete("/api/user")
          .send({
            id: res.body.users[0]._id
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(res.body.success).toBeDefined();
            expect(res.body.success).toBe(true);
            done();
          });
        });
      });
    });
  });
});