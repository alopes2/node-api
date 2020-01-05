const express = require('express');
const { body } = require('express-validator');

const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/posts
router.post(
  '/post',
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

module.exports = router;
