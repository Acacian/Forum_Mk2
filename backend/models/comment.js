const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user_name: {
    type: String,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  original_post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  }
});

module.exports = mongoose.model('Comment', commentSchema);
