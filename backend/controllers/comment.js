const fs = require('fs');

const { validationResult } = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

//add comments into posts
//use schema in comment.js
exports.getComments = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const comments = await Comment
        .find({ original_post: postId })
        .sort({ createdAt: -1 });
    res.status(200).json({
      message: 'Fetched comments successfully.',
      comments: comments
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.createComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const comment = req.body.comment;
  const postId = req.params.postId;
  const creator = await User.findById(req.userId);
  const comment1 = new Comment({
    comment: comment,
    user_name: creator.name,
    original_post: postId
  });
  try {
    // db에 저장
    await comment1.save();
    // socket을 써서 실시간으로 댓글을 보여줌
    io.getIO().emit('comment', {
      comment: { ...comment1._doc, creator: { _id: req.userId, name: creator.name } }
    });
    res.status(201).json({
      message: 'Comment created successfully!',
      post_id : comment1.original_post,
      user_name : comment1.user_name,
      comment: comment1.comment
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//edit comments
exports.updateComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const comment = req.body.comment;
  // find user's id to check user's name
  const user = await User.findById(req.userId);
  try {
    const comment1 = await Comment
        .findById(commentId);
    if (!comment1) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    if (comment1.user_name.toString() !== user.name) {
      const error = new Error('Not authorized!');
      console.log(comment1.user_name.toString());
      console.log(user.name);
      error.statusCode = 403;
      throw error;
    }
    comment1.comment = comment;
    const result = await comment1.save();
    res.status(200).json({ message: 'Comment updated!', comment: result });
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//delete comments
//comment doesn't have any image so we don't need to delete image, just delete comment and unlink it from post
exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const user = await User.findById(req.userId);
  try {
    const comment1 = await Comment.findById(commentId);
    if (!comment1) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    if (comment1.user_name.toString() !== user.name) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    fs.unlink(comment1.comment, err => console.log(err));
    await Comment
        .findByIdAndRemove(commentId);

    res.status(200).json({ message: 'Deleted comment.' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        }
}