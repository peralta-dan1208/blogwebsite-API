const Blog = require('../models/Blog');
const { errorHandler } = require("../auth");

module.exports.createPost = async (req, res) => {
    try {
        const newPost = new Blog({
            title: req.body.title,
            content: req.body.content,
            author: req.user.id
        });

        const savedPost = await newPost.save();

        return res.status(201).send({
            success: true,
            message: 'Post created successfully',
            post: savedPost
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

module.exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Blog.find()
        .populate('author', 'username _id')
        .sort({ createdOn: -1 });

        return res.status(200).send(posts);
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

module.exports.getPost = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.postId)
        .populate('author', 'username _id')

        if (!post) {
            return res.status(404).send({
                success: false,
                message: 'Post not found'
            });
        }

        return res.status(200).send(post);
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

module.exports.updatePost = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.postId);

        if (!post) {
            return res.status(404).send({
                success: false,
                message: 'Post not found'
            });
        }

        if (post.author.toString() !== req.user.id) {
            return res.status(403).send({
                success: false,
                message: 'Unauthorized'
            });
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        const updatedPost = await post.save();

        return res.status(200).send({
            success: true,
            message: 'Post updated successfully',
            post: updatedPost
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

module.exports.deletePost = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.postId);

        if (!post) {
            return res.status(404).send({
                success: false,
                message: 'Post not found'
            });
        }

        const isOwner = post.author.toString() === req.user.id;
        if (!req.user.isAdmin && !isOwner) {
            return res.status(403).send({
                success: false,
                message: 'Unauthorized'
            });
        }

        await Blog.findByIdAndDelete(req.params.postId);

        return res.status(200).send({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

module.exports.addPostComment = async (req, res) => {

    const newComment = {
        userId: req.user.id,
        username: req.user.username,
        comment: req.body.comment
    };

    return Blog.findByIdAndUpdate(
        req.params.postId,
        { $push: {comments: newComment } },
        { new: true }
        )
    .then(post => {
        if(!post){
            return res.status(404).send({message: 'Post not found'});
        }

        return res.status(200).send({
            message: 'Comment added successfully',
            updatedPost: post
        });
    })
    .catch(err => errorHandler(err,req,res));

}

module.exports.getPostComments = (req,res) => {

    return Blog.findById(req.params.postId)
    .then(post => {
        if(!post) {
            return res.status(404).send({ message: 'post not found' });
        }
        return res.status(200).send({
            comments: post.comments
        });
    })
    .catch(err => errorHandler(err,req,res));
}

module.exports.deletePostComment = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.postId);
        if (!post) {
            return res.status(404).send({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).send({
                success: false,
                message: 'Comment not found'
            });
        }

        const isCommentOwner = comment.userId.toString() === req.user.id
        const isAdmin = req.user.isAdmin;
        if (!isCommentOwner && !isAdmin) {
            return res.status(403).send({
                success: false,
                message: 'Unauthorized'
            });
        }

        comment.deleteOne();
        await post.save();
        return res.status(200).send({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};