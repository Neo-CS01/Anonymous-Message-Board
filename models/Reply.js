const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReplySchema = new Schema(
  {
    thread_id: { type: ObjectId, ref: "Thread" },
    text: { type: String, required: true },
    delete_password: { type: String, required: true },
    reported: { type: Boolean, default: false },
    created_on: { type: Date, default: Date.now },
  },
  {
    versionKey: false, // Suppresses Mongoose versioning __v field
  }
);

// Custom toJSON method to remove sensitive fields
ReplySchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.delete_password;
  delete obj.reported;
  return obj;
};

module.exports = mongoose.model("Reply", ReplySchema);
