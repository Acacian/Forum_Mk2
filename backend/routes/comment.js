const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/comment');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// POST /comment/post   
router.post(
  '/:postId/comment',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.createPost
);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put(
  '/post/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 2 }),
    body('content')
      .trim()
      .isLength({ min: 2 })
  ],
  feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

//find the post by title
router.get('/post/find/:title', isAuth, feedController.findPost);

module.exports = router;
