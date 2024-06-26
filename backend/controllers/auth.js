const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('A user with this email could not be found.');
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '24h' }
    );
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: 'User updated.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.quit = async (req, res, next) => {
  // check admin, and if admin, delete one users which is not admin. find by id to delete user
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    if (!user.admin) {
      const error = new Error('Cant erase admin.');
      error.statusCode = 403;
      throw error;
    }
    if (req.body.userId === req.userId) {
      const error = new Error('Cant erase yourself.');
      error.statusCode = 403;
      throw error;
    }
    const deluser = await User.findById(req.body.userId);
    if (!deluser) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    // delete all posts before deleting user
    const delposts = await Post.find({ creator: req.body.userId });
    for (let i = 0; i < delposts.length; i++) {
      await Post.findByIdAndRemove(delposts[i]._id);
    }
    // delete all comments before deleting user
    const delcomments = await Comment.find({ creator: req.body.userId });
    for (let i = 0; i < delcomments.length; i++) {
      await Comment.findByIdAndRemove(delcomments[i]._id);
    }

    await User.findByIdAndRemove(req.body.userId);
    // delete all posts which are linked to the user
    res.status(200).json({ message: 'User deleted.' });
  }
  catch (err) {
    if (!err.statusCode) {
      console.log("here is error")
      err.statusCode = 500;
    }
    next(err);
  }
};