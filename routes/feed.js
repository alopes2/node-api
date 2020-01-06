const express = require('express');
const { body } = require('express-validator');
const updload = require('multer');

const feedController = require('../controllers/feed');

const router = express.Router();

const fileStorage = updload.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/posts
router.post(
  '/post',
  updload({ storage: fileStorage, fileFilter: filefilter}).single('image'),
  [
    body('title', 'Title is required and have at least 5 chars.')
      .trim()
      .isLength({ min: 5 }),
    body('content', 'Content is required and have at least 5 chars.')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.createPost
);

// GET /feed/posts/123
router.get('/post/:postId', feedController.getPost);

// PUT /feed/post/123
router.put(
  '/post/:postId',
  updload({ storage: fileStorage, fileFilter: filefilter}).single('image'),
  [
    body('title', 'Title is required and have at least 5 chars.')
      .trim()
      .isLength({ min: 5 }),
    body('content', 'Content is required and have at least 5 chars.')
      .trim()
      .isLength({ min: 5 })
  ],
  feedController.updatePost
);

// DELETE /feed/post/123
router.delete(
  '/post/:postId',
  feedController.deletePost
);

module.exports = router;
