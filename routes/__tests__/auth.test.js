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

describe("----- Auth Routes -----", () => {
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

  describe("/api/auth/signup", () => {
    //----- Test 1 -----
    it("(POST) successfully signs-up user", done => {
      request(app)
      .post("/api/auth/signup")
      .send({
        username: "bob",
        password: "pass"
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

  describe("/api/auth/login", () => {
    //----- Test 2 -----
    it("(POST) successfully logs-in user", done => {
      // Signup user
      request(app)
      .post("/api/auth/signup")
      .send({
        username: "bob",
        password: "pass"
      })
      .end(err => {
        if(err) return done(err);
        // Login user
        request(app)
        .post("/api/auth/login")
        .send({
          username: "bob",
          password: "pass"
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.statusCode).toBe(200);
          expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
          expect(res.body.success).toBeDefined();
          expect(res.body.success).toBe(true);
          expect(res.body.user).toBeDefined();
          expect(res.body.user.username).toBe("bob");
          done();
        });
      });
    });
  });

  describe("/api/auth/logout", () => {
    //----- Test 3 -----
    it("(POST) successfully logs-out user", done => {
      // Signup user
      request(app)
      .post("/api/auth/signup")
      .send({
        username: "bob",
        password: "pass"
      })
      .end(err => {
        if(err) return done(err);
        // Login user
        request(app)
        .post("/api/auth/login")
        .send({
          username: "bob",
          password: "pass"
        })
        .end(err => {
          if(err) return done(err);
          // Logout user
          request(app)
          .post("/api/auth/logout")
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

  describe("/api/auth/getUser", () => {
    //----- Test 4 -----
    it("(GET) successfully retrieves the authenticated user", done => {
      // Signup user
      request(app)
      .post("/api/auth/signup")
      .send({
        username: "bob",
        password: "pass"
      })
      .end(err => {
        if(err) return done(err);
        // Login user
        request(app)
        .post("/api/auth/login")
        .send({
          username: "bob",
          password: "pass"
        })
        .end(err => {
          if(err) return done(err);
          // Get autenticated user
          request(app)
          .get("/api/auth/getUser")
          .end((err, res) => {
            if(err) return done(err);
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(res.body.success).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.user).toBeDefined();
            expect(res.body.user.username).toBe("bob");
            done();
          });
        });
      });
    });
  });
});