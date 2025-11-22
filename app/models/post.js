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
    city: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
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
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
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

// Add indexes for frequently queried fields
postSchema.index({ isApproved: 1 });
postSchema.index({ category: 1, isApproved: 1 });
postSchema.index({ state: 1, isApproved: 1 });
postSchema.index({ user: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model( "Post", postSchema);
