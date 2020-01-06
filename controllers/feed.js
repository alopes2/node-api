const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const pageSize = 2;
  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    res.status(200).json({
      message: 'Fetched posts successfully.',
      posts: posts,
      totalItems: totalItems
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }

    next(e);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }

    if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace('\\', '/');

    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: { name: 'Andre Lopes' }
    });

    var result = await post.save();

    console.log(result);

    res.status(201).json({
      message: 'Post successfully created!',
      post: result
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }

    next(e);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Post fetched.', post: post });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }

    next(e);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
      imageUrl = req.file.path.replace('\\', '/');
    }

    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    var result = await post.save();

    console.log(result);

    res.status(200).json({
      message: 'Post successfully updated!',
      post: result
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }

    next(e);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }

    clearImage(post.imageUrl);

    var result = await post.remove();

    console.log(result);

    res.status(200).json({
      message: 'Post successfully deleted!',
      post: result
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }

    next(e);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);

  fs.unlink(filePath, err => console.log(err));
};
