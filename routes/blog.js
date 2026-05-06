const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog');
const { verify } = require('../auth');

router.get('/', blogController.getAllPosts);
router.get('/:postId', blogController.getPost);
router.post('/create-post', verify, blogController.createPost);
router.patch('/:postId/update', verify, blogController.updatePost);
router.delete('/:postId', verify, blogController.deletePost);

router.get('/:postId/comments', blogController.getPostComments);
router.post('/:postId/comments', verify, blogController.addPostComment);
router.delete('/:postId/comments/:commentId', verify, blogController.deletePostComment);

module.exports = router;