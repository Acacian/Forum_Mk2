const express = require('express');
const { body } = require('express-validator/check');

const commentController = require('../controllers/comment');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// 댓글 생성
router.post(
  '/:postId',
  isAuth,
  [
    body('comment')
      .trim()
      .isLength({ min: 1 })
  ],
  commentController.createComment
);

// 댓글 수정
router.put(
  '/:postId/:commentId',
  isAuth,
  [
    body('comment')
      .trim()
      .isLength({ min: 1 })
  ],
  commentController.updateComment
);

router.delete('/:postId/:commentId', isAuth, commentController.deleteComment);

router.get('/:postId', isAuth, commentController.getComments)

module.exports = router;
