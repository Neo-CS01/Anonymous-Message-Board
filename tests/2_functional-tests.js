const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { threads } = require("../mock/threads");
const Thread = require('../models/thread');
chai.use(chaiHttp);

suite("Functional Tests", function () {
  // Ensure server is properly set up and tests run sequentially
  before(function (done) {
    server.on("listening", function () {
      console.log("Server is running");
      done();
    });
  });

  before(async function() {
    // Seed initial data
    await Thread.deleteMany({});
    await Thread.insertMany(threads);
  });

  // Clean up after all tests are done
  after(function (done) {
    server.close(function () {
      console.log("Server closed");
      done();
    });
  });

  test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .post("/api/threads/general")
      .send({ text: "My thread", delete_password: "password" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id', 'Thread should have an _id');
        done();
      });
  });

  test("Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}", function (done) {
    chai
      .request(server)
      .get("/api/threads/general")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        if (res.body.length > 0) {
          assert.property(res.body[0], "text", "Threads should contain text");
        }
        done();
      });
  });

  test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .put(`/api/threads/general`)
      .send({ report_id: threadId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Creating a new reply: POST request to /api/replies/{board}", function (done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .post(`/api/replies/general`)
      .send({
        thread_id: threadId,
        text: "My Reply",
        delete_password: "password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, '_id', 'Reply should have an _id');
        done();
      });
  });
    
  test("Creating a new thread: POST request to /api/threads/{board}", function (done) {
  chai
    .request(server)
    .post("/api/threads/general")
    .send({ text: "My thread", delete_password: "password" })
    .end(function (err, res) {
      assert.equal(res.status, 200);
      assert.property(res.body, '_id', 'Thread should have an _id');
      assert.property(res.body, 'text', 'Thread should have text');
      assert.property(res.body, 'created_on', 'Thread should have created_on');
      assert.property(res.body, 'bumped_on', 'Thread should have bumped_on');
      done();
    });
});
 
  test("Viewing a single thread with all replies: GET request to /api/replies/{board}", function (done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .get(`/api/replies/general/${threadId}`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body, "response should be an object");
        assert.property(res.body, 'text', 'Thread should contain text');
        done();
      });
  });
});
