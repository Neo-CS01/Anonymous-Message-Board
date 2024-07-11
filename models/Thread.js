const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  // Define schema fields
});

const thread = mongoose.model('thread', threadSchema);

module.exports = thread;
