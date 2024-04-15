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
    // make notice post
    notice: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
