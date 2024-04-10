const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

//add comments into posts
exports.createComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const comment = req.body.comment;
  const postId = req.params.postId;
  let creator;
  const post = await Post.findById(postId);
  const comment1 = new Comment({
    comment: comment,
    user_name: req.userId
  });
  try {
    await comment1.save();
    post.comments.push(comment1);
    await post.save();
    io.getIO().emit('comments', {
      action: 'create',
      comment: { ...comment1._doc, user_name: req.userId }
    });
    res.status(201).json({
      message: 'Comment created successfully!',
      comment: comment1,
      creator: { _id: creator._id, name: creator.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};