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

//edit comments
exports.updateComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  const comment = req.body.comment;
  try {
    const comment1 = await Comment.findById(commentId).populate('post');
    if (!comment1) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    if (comment1.user_name.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    comment1.comment = comment;
    const result = await comment1.save();
    io.getIO().emit('comments', { action: 'update', comment: result });
    res.status(200).json({ message: 'Comment updated!', comment: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//delete comments
exports.deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    const comment1 = await Comment.findById(commentId);
    if (!comment1) {
      const error = new Error('Could not find comment.');
      error.statusCode = 404;
      throw error;
    }
    if (comment1.user_name.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    clearImage(comment1.imageUrl);
    await Comment
        .findByIdAndRemove(commentId);
    const post = await Post.findById(comment1.post);
    post.comments.pull(commentId);
    await post.save();
    io.getIO().emit('comments', { action: 'delete', comment: commentId });
    res.status(200).json({ message: 'Deleted comment.' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
        }
}