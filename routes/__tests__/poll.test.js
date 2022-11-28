//----- Imports
const mongoose = require("mongoose");
const request = require("supertest");
const express = require("express");
const app = new express();
require("dotenv").config({ path: "./config.env" });
const pollRoutes = require("../poll");

//----- Middleware
app.use(express.json()); // needed to test POST requests
app.use("/", pollRoutes);

//----- Routes
app.use(require("../poll"));

describe("----- Poll Routes -----", () => {
  beforeEach(done => {
    mongoose.connect(process.env.ATLAS_TESTING_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true 
    })
    .then(() => {
      // Clear initial data
      const Poll = mongoose.model("Poll");
      return Poll.deleteMany({})
    })
    .then(() => done());
  });
  
  afterEach(done => {
    // Clear test data
    const Poll = mongoose.model("Poll");
    Poll.deleteMany({})
    .then(() => mongoose.connection.close())
    .then(() => done());
  });

  describe("/api/polls", () => {
    //----- Test 1 -----
    it("(POST) successfully creates a poll", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
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

    //----- Test 2 -----
    it("(GET) successfully retrieves polls", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
      })
      .end(err => {
        if(err) return done(err);
        // Create 2nd poll
        request(app)
        .post("/api/polls")
        .send({
          userId: mongoose.Types.ObjectId("200000000000000000000000"),
          topic: "Test Poll 2", 
          options: "first,sconed,third"
        })
        .end(err => {
          if(err) return done(err);
          // Retrieve all polls
          request(app)
          .get("/api/polls")
          .end((err, res) => {
            if(err) return done(err);
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(res.body.success).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.polls).toBeDefined();
            expect(Array.isArray(res.body.polls)).toBe(true);
            expect(res.body.polls).toHaveLength(2);
            done();
          });
        });
      });
    });
  });

  describe("/api/polls/user", () => {
    //----- Test 3 -----
    it("(POST) successfully retrieves polls for given user", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
      })
      .end(err => {
        if(err) return done(err);
        // Create 2nd poll
        request(app)
        .post("/api/polls")
        .send({
          userId: mongoose.Types.ObjectId("100000000000000000000000"),
          topic: "Test Poll 2", 
          options: "first,sconed,third"
        })
        .end(err => {
          if(err) return done(err);
          request(app)
          .post("/api/polls/user")
          .send({
            id: mongoose.Types.ObjectId("100000000000000000000000")
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(res.body.success).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.polls).toBeDefined();
            expect(Array.isArray(res.body.polls)).toBe(true);
            expect(res.body.polls).toHaveLength(2);
            done();
          });
        });
      });
    });
  });

  describe("/api/poll", () => {
    //----- Test 4 -----
    it("(POST) successfully retrieves given poll", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
      })
      .end(err => {
        if(err) return done(err);
        // Retrieve all polls
        request(app)
        .get("/api/polls")
        .end((err, res) => {
          if(err) return done(err);
          // Retrieve given poll
          request(app)
          .post("/api/poll")
          .send({
            id: res.body.polls[0]._id
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.statusCode).toBe(200);
            expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
            expect(res.body.success).toBeDefined();
            expect(res.body.success).toBe(true);
            expect(res.body.poll).toBeDefined();
            done();
          });
        });
      });
    });

    //----- Test 5 -----
    it("(DELETE) successfully deletes given poll", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
      })
      .end(err => {
        if(err) return done(err);
        // Retrieve all polls
        request(app)
        .get("/api/polls")
        .end((err, res) => {
          if(err) return done(err);
          // Delete given poll
          request(app)
          .delete("/api/poll")
          .send({
            id: res.body.polls[0]._id
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

  describe("/api/poll/vote", () => {
    //----- Test 6 -----
    it("(PUT) successfully retrieves polls for given user", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
      })
      .end(err => {
        if(err) return done(err);
        // Retrieve all polls
        request(app)
        .get("/api/polls")
        .end((err, res) => {
          if(err) return done(err);
          // Vote for given poll
          request(app)
          .put("/api/poll/vote")
          .send({
            id: res.body.polls[0]._id,
            choice: "first"
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

  describe("/api/poll/option", () => {
    //----- Test 7 -----
    it("(PUT) successfully adds option for given poll", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
      })
      .end(err => {
        if(err) return done(err);
        // Retrieve all polls
        request(app)
        .get("/api/polls")
        .end((err, res) => {
          if(err) return done(err);
          // Add option for given poll
          request(app)
          .put("/api/poll/option")
          .send({
            id: res.body.polls[0]._id,
            newOption: "fourth"
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

  describe("/api/poll/status", () => {
    //----- Test 8 -----
    it("(PUT) successfully changes status for given poll", done => {
      // Create poll
      request(app)
      .post("/api/polls")
      .send({
        userId: mongoose.Types.ObjectId("100000000000000000000000"),
        topic: "Test Poll", 
        options: "first,sconed,third"
      })
      .end(err => {
        if(err) return done(err);
        // Retrieve all polls
        request(app)
        .get("/api/polls")
        .end((err, res) => {
          if(err) return done(err);
          // Change status for given poll
          request(app)
          .put("/api/poll/status")
          .send({
            id: res.body.polls[0]._id,
            status: "close"
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