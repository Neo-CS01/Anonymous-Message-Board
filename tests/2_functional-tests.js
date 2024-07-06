const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { threads } = require("../mock/threads");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  // Ensure server is properly set up and tests run sequentially
  before(function (done) {
    server.on("listening", function () {
      console.log("Server is running");
      done();
    });
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
        assert.property(res.body[0], "text", "Threads should contain text");
        done();
      });
  });

  test("Reporting a thread: PUT request to /api/threads/{board}", function (done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .put(`/api/threads/general/${threadId}`)
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
      .post(`/api/replies/general/${threadId}`)
      .send({
        text: "My Reply",
        delete_password: "password",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
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
        done();
      });
  });

  test("Reporting a reply: PUT request to /api/replies/{board}", function (done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    const replyId = threads[0].replies[0]._id; // Assuming replies are predefined
    chai
      .request(server)
      .put(`/api/replies/general/${threadId}`)
      .send({ reply_id: replyId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "reported");
        done();
      });
  });

  test("Deleting a reply with the correct password: DELETE request to /api/replies/{board}", function (done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    const replyId = threads[0].replies[0]._id; // Assuming replies are predefined
    chai
      .request(server)
      .delete(`/api/replies/general/${threadId}`)
      .send({ reply_id: replyId, delete_password: "password" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });

  test("Deleting a thread with the correct password: DELETE request to /api/threads/{board}", function (done) {
    const threadId = threads[0]._id; // Assuming threads are predefined
    chai
      .request(server)
      .delete(`/api/threads/general/${threadId}`)
      .send({ delete_password: "password" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, "success");
        done();
      });
  });
});
