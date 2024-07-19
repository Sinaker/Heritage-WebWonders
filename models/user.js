const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  resetToken: String,
  resetTokenExpiry: Date,
  likes: [
    {
      post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
      like: {
        type: Boolean,
        default: false,
      },
      dislike: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
