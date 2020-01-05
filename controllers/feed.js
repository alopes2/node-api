const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: 1,
        title: 'First post',
        content: 'This is the first post!',
        imageUrl: 'images/duck.jpg',
        creator: {
          name: 'Andre Lopes'
        },
        createdAt: new Date()
      }
    ]
  });
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Validation failed, entered data is incorrect.',
      errors: errors.array()
    });
  }

  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/duck',
    creator: { name: 'Andre Lopes' }
  });

  try {
    var result = await post.save();

    console.log(result);
  
    res.status(201).json({
      message: 'Post successfully created!',
      post: result
    });
  } catch(e) {
    console.log(e);
  }
};
