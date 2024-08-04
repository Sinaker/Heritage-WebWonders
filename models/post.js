const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    month: {
      type: Number,
    },
    state: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      requried: true,
    },
    description: {
      type: String,
      required: true,
    },
    isApproved: {
      type: String,
      default: "pending",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
