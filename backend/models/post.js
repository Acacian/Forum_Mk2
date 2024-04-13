const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    // creator id to get user info
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // comment id to get all comments
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    // make notice post
    notice: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
