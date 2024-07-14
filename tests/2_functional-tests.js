const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { threads } = require("../mock/threads");
const Thread = require('../models/Thread');
const mongoose = require('mongoose'); // Add this line
chai.use(chaiHttp);

suite("Functional Tests", function() {
  this.timeout(20000); // Increase timeout to 20 seconds

  // Ensure server is properly set up and tests run sequentially
  before(function(done) {
    this.timeout(5000); // Increase timeout to 5000ms
    mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Database connected');
        done();
      })
      .catch(err => {
        console.error('Database connection error:', err);
        done(err);
      });
  });

  before(async function() {
    this.timeout(10000); // Increase timeout for this hook to 10 seconds
    console.log("Seeding initial data");

    // Verify database connection
    if (!Thread.db) {
      console.error("Database connection is not established");
      throw new Error("Database connection is not established");
    }

    try {
      await Thread.deleteMany({});
      console.log("All threads deleted");
      await Thread.insertMany(threads);
      console.log("Initial threads inserted");
    } catch (err) {
      console.error("Error in before hook:", err);
      throw err; // Ensure that errors are propagated
    }
  });

  // Clean up after all tests are done
  after(function(done) {
    server.close(function() {
      console.log("Server closed");
      done();
    });
  });

  test("Creating a new thread: POST request to /api/threads/{board}", function(done) {
    chai
      .request(server)
      .post("/api/threads/general")
      .send({ text: "My thread", delete_password: "password" })
      .end(function(err, res) {
        if (err) {
          console.error("Error in POST /api/threads/general:", err);
          return done(err);
        }
        assert.equal(res.status, 200);
        assert.property(res.body, '_id', 'Thread should have an _id');
        done();
      });
  });

  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function(done) {
    chai
      .request(server)
      .get("/api/threads/general")
      .end(function(err, res) {
        if (err) {
          console.error("Error in GET /api/threads/general:", err);
          return done(err);
        }
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        if (res.body.length > 0) {
          assert.property(res.body[0], "text", "Threads should contain text");
        }
        done();
      });
  });

  test("Reporting a thread: PUT request to /api/threads/{board}", function(done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .put(`/api/threads/general`)
      .send({ report_id: threadId })
      .end(function(err, res) {
        if (err) {
          console.error("Error in PUT /api/threads/general:", err);
          return done(err);
        }
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Creating a new reply: POST request to /api/replies/{board}", function(done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .post(`/api/replies/general`)
      .send({
        thread_id: threadId,
        text: "My Reply",
        delete_password: "password",
      })
      .end(function(err, res) {
        if (err) {
          console.error("Error in POST /api/replies/general:", err);
          return done(err);
        }
        assert.equal(res.status, 200);
        assert.property(res.body, '_id', 'Reply should have an _id');
        done();
      });
  });

  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function(done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .get(`/api/replies/general/${threadId}`)
      .end(function(err, res) {
        if (err) {
          console.error("Error in GET /api/replies/general/:threadId:", err);
          return done(err);
        }
        assert.equal(res.status, 200);
        assert.isObject(res.body, "response should be an object");
        assert.property(res.body, 'text', 'Thread should contain text');
        done();
      });
  });
});
