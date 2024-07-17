const path = require("path");
const fs = require("node:fs");

const User = require("../models/user");
const Post = require("../models/post");
const { validationResult } = require("express-validator");

const POSTS_PER_PAGE = 7;

exports.getHome = (req, res, next) => {
  const login = req.query.login;
  const email = req.query.mailSent;

  res.status(200).render("heropage", {
    pageTitle: "Darshan",
    normal: false,
    dark: false,
    login: login ?? false,
    email: email ?? false,
  });
};

exports.getDashboard = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const totalPosts = await Post.countDocuments({ user: req.user._id });
    const user = await User.findById(req.user._id)
      .populate({
        path: "posts",
        options: {
          skip: (page - 1) * POSTS_PER_PAGE,
          limit: POSTS_PER_PAGE,
        },
      })
      .exec();
    if (!user) {
      const error = new Error("No User found");
      error.httpStatusCode = 404;
      next(error);
    }
    res.status(200).render("user/dashboard", {
      pageTitle: "Darshan",
      normal: false,
      dark: true,
      username: user.username,
      posts: user.posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / POSTS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); //Activated error middleware
  }
};

exports.getAddPost = (req, res, next) => {
  res.status(200).render("user/addPost", {
    pageTitle: "Add a Post",
    normal: false,
    dark: true,
    editing: false,
    errors: [],
    oldInput: { title: "", category: "", state: "", description: "" },
  });
};

exports.postAddPost = async (req, res, next) => {
  const file = req.file;
  const category = req.body.category;
  const title = req.body.title;
  const description = req.body.description;
  const state = req.body.state;
  const month = +req.body.month ?? 0;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).render("user/addPost", {
      pageTitle: "Add a Post",
      normal: false,
      dark: true,
      editing: false,
      errors: errors.array(),
      oldInput: { title, category, state, description, month },
    });
  }
  if (!req.file) {
    return res.status(200).render("user/addPost", {
      pageTitle: "Add a Post",
      normal: false,
      dark: true,
      editing: false,
      errors: [{ path: "post_img", msg: "Please add an image to the post." }],
      oldInput: { title, category, state, description, month },
    });
  }

  const imageUrl = file.path.replace(/\\/g, "/");
  const post = month
    ? new Post({
        title,
        category,
        state,
        imageUrl,
        description,
        user: req.user,
        month,
      })
    : new Post({
        title,
        category,
        state,
        imageUrl,
        description,
        user: req.user,
      });
  //We should also update user model
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("No User found");
      error.httpStatusCode = 404;
      next(error);
    }
    user.posts.push(post._id);

    await post.save();
    await user.save();

    return res.redirect("/user/dashboard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); //Activated error middleware
  }
};

exports.getEditPost = async (req, res, next) => {
  const postID = req.params.postID;
  const post = await Post.findById(postID);
  res.status(200).render("user/addPost", {
    pageTitle: "Edit Post",
    normal: false,
    dark: true,
    editing: true,
    errors: [],
    oldInput: post,
    postID: postID,
  });
};

exports.postEditPost = async (req, res, next) => {
  const postID = req.params.postID;

  const updatedTitle = req.body.title;
  const updatedCategory = req.body.category;
  const updatedState = req.body.state;
  const updatedDescription = req.body.description;
  const file = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).render("user/addPost", {
      pageTitle: "Add a Post",
      normal: false,
      dark: true,
      editing: true,
      errors: errors.array(),
      oldInput: {
        title: updatedTitle,
        category: updatedCategory,
        state: updatedState,
        description: updatedDescription,
      },
      postID: postID,
    });
  }

  try {
    const post = await Post.findById(postID);
    let imageUrl = "";

    if (file) {
      imageUrl = file.path.replace(/\\/g, "/"); //Only change path if file has an image
    }

    //Updating model
    post.title = updatedTitle;
    post.category = updatedCategory;
    post.state = updatedState;
    post.description = updatedDescription;

    if (imageUrl) {
      //If new file is put

      //Delete old file
      fs.unlink(
        path.join(__dirname, "..", ...post.imageUrl.split("/")),
        (err) => console.log("Error in deleting = ", err)
      ); //Hit and run promise
    }
    if (imageUrl) post.imageUrl = imageUrl;
    //No need to update user model

    await post.save();
    console.log("EDIT SUCCESSFUL");
    return res.redirect("/user/dashboard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); //Activated error middleware
  }
};

exports.deletePost = async (req, res, next) => {
  const postID = req.params.postID;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("No User found");
      error.httpStatusCode = 404;
      return next(error);
    }

    // Remove the postID from the user's posts array
    user.posts = user.posts.filter((id) => id.toString() !== postID.toString());

    await user.save();
    const deletedPost = await Post.findByIdAndDelete(postID);

    // Also have to deleted the stored image file
    const imgUrl = deletedPost.imageUrl.split("/");

    fs.unlink(path.join(__dirname, "..", ...imgUrl), (err) =>
      console.log("Error in deleting = ", err)
    ); //Hit and run promise

    console.log("POST DESTROYED");
    return res.redirect("/user/dashboard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); // Activate error middleware
  }
};

exports.getDetails = async (req, res, next) => {
  const postID = req.params.postID;
  const post = await Post.findById(postID);

  res.render("user/details", {
    pageTitle: post.title,
    normal: false,
    dark: true,
    post: post,
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  });
};
