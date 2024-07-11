const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: { type: String, required: true },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply'
  }]
});

// Method to hide sensitive fields from the response
ThreadSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.delete_password;
  delete obj.reported;
  return obj;
};

const modelName = 'Thread';

if (mongoose.models[modelName]) {
  module.exports = mongoose.models[modelName];
} else {
  module.exports = mongoose.model(modelName, ThreadSchema);
}
