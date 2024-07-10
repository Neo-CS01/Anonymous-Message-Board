const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
  // Define schema fields
});

const Thread = mongoose.model('Thread', ThreadSchema);

module.exports = Thread;
