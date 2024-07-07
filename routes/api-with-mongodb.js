"use strict";

const Reply = require("../models/Reply");
const Thread = require("../models/Thread");

module.exports = function (app) {
  app.route("/api/threads/:board")
    .get(async function (req, res) {
      const board = req.params.board;
      console.time("[GET] - /api/threads/:board");

      try {
        const result = await Thread.aggregate([
          { $match: { board } },
          {
            $project: {
              text: 1,
              replies: 1,
              created_on: 1,
              bumped_on: 1,
              replycount: { $size: "$replies" },
            },
          },
          {
            $lookup: {
              from: "replies",
              localField: "replies",
              foreignField: "_id",
              as: "replies",
              pipeline: [
                { $sort: { created_on: -1 } },
                { $limit: 3 },
                { $project: { text: 1, created_on: 1 } },
              ],
            },
          },
          { $sort: { bumped_on: -1 } },
          { $limit: 10 },
        ]);

        console.timeEnd("[GET] - /api/threads/:board");
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    })
    .post(async function (req, res) {
      const board = req.params.board;
      console.time("[POST] - /api/threads/:board");

      try {
        const { text, delete_password } = req.body;
        const currentDate = Date.now();

        await Thread.create({
          board,
          text,
          delete_password,
          created_on: currentDate,
          bumped_on: currentDate,
        });

        console.timeEnd("[POST] - /api/threads/:board");
        res.redirect(`/b/${board}/`);
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    })
    .put(async function (req, res) {
      console.time("[PUT] - /api/threads/:board");

      try {
        const { report_id } = req.body;
        const thread = await Thread.findByIdAndUpdate(
          report_id,
          { reported: true, bumped_on: Date.now() },
          { new: true }
        );

        console.timeEnd("[PUT] - /api/threads/:board");
        if (!thread) return res.status(404).send("Thread not found");
        res.send("reported");
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    })
    .delete(async function (req, res) {
      console.time("[DELETE] - /api/threads/:board");

      try {
        const { thread_id, delete_password } = req.body;
        const thread = await Thread.findOneAndRemove({
          _id: thread_id,
          delete_password,
        });

        console.timeEnd("[DELETE] - /api/threads/:board");
        if (!thread) return res.send("incorrect password");
        res.send("success");
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    });

  app.route("/api/replies/:board")
    .get(async function (req, res) {
      console.time("[GET] - /api/replies/:board");

      try {
        const threadId = req.query.thread_id;
        const result = await Thread.findById(threadId).populate(
          "replies",
          "text created_on"
        );

        console.timeEnd("[GET] - /api/replies/:board");
        if (!result) return res.status(404).send("Thread not found");
        res.json(result);
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    })
    .post(async function (req, res) {
      const board = req.params.board;
      console.time("[POST] - /api/replies/:board");

      try {
        const { text, delete_password, thread_id } = req.body;
        const reply = new Reply({
          text,
          thread_id,
          delete_password,
        });

        await reply.save();

        const thread = await Thread.findByIdAndUpdate(
          thread_id,
          {
            $push: { replies: reply._id },
            bumped_on: reply.created_on,
          },
          { new: true }
        );

        console.timeEnd("[POST] - /api/replies/:board");
        res.redirect(`/b/${board}/${thread._id.toString()}`);
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    })
    .put(async function (req, res) {
      console.time("[PUT] - /api/replies/:board");

      try {
        const { reply_id } = req.body;
        const reply = await Reply.findByIdAndUpdate(reply_id, { reported: true });

        console.timeEnd("[PUT] - /api/replies/:board");
        if (!reply) return res.status(404).send("Reply not found");
        res.send("reported");
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    })
    .delete(async function (req, res) {
      console.time("[DELETE] - /api/replies/:board");

      try {
        const { reply_id, delete_password } = req.body;
        const reply = await Reply.findOneAndUpdate(
          { _id: reply_id, delete_password },
          { text: "[deleted]" }
        );

        console.timeEnd("[DELETE] - /api/replies/:board");
        if (!reply) return res.send("incorrect password");
        res.send("success");
      } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
      }
    });
};
