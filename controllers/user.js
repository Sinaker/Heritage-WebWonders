const path = require("path");
const fs = require("node:fs");
const axios = require("axios");

const User = require("../models/user");
const Post = require("../models/post");
const { validationResult } = require("express-validator");
const post = require("../models/post");

const POSTS_PER_PAGE = 7;

async function getCoordinates(city) {
  const query = `
[out:json][timeout:25];
area(id:3600304716)->.searchArea;
(
  node["name"="${city}"]["place"="city"](area.searchArea);
  way["name"="${city}"]["place"="city"](area.searchArea);
  relation["name"="${city}"]["place"="city"](area.searchArea);
);
out body;
>;
out skel qt;
`; //Overpass turbo query
  const url = "https://overpass-api.de/api/interpreter";
  let data;

  try {
    const response = await axios.post(url, query, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    data = response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  if (data.elements && data.elements.length > 0) {
    const element = data.elements[0]; // Assuming you want the first result
    return [element.lon, element.lat]; // Correct property name for latitude
  }

  return null;
}

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
    const request = req.query.request;
    const page = +req.query.page || 1;
    const totalPosts = await Post.countDocuments({ user: req.user._id });
    const totalApprovedPosts = await Post.countDocuments({
      user: req.user._id,
      isApproved: "true",
    });
    const totalRejectedPosts = await Post.countDocuments({
      user: req.user._id,
      isApproved: "false",
    });

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
      request,
      status: page === 1,
      accepted: totalApprovedPosts,
      rejected: totalRejectedPosts,
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
  const city = req.body.city;

  const errors = validationResult(req);
  let longitude = null,
    latitude = null;

  if (city) {
    const coordinates = await getCoordinates(city);
    [latitude = null, longitude = null] = coordinates || [];
    if (latitude !== null && longitude !== null) {
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    } else {
      return res.status(402).render("user/addPost", {
        pageTitle: "Add a Post",
        normal: false,
        dark: true,
        editing: false,
        errors: [
          {
            path: "city",
            msg: "Please add a valid city. (Try a more popular city)",
          },
        ],
        oldInput: { title, category, state, description, month, city },
      });
    }
  }

  if (!errors.isEmpty()) {
    return res.status(402).render("user/addPost", {
      pageTitle: "Add a Post",
      normal: false,
      dark: true,
      editing: false,
      errors: errors.array(),
      oldInput: { title, category, state, description, month, city },
    });
  }

  if (!file) {
    return res.status(402).render("user/addPost", {
      pageTitle: "Add a Post",
      normal: false,
      dark: true,
      editing: false,
      errors: [{ path: "post_img", msg: "Please add an image to the post." }],
      oldInput: { title, category, state, description, month, city },
    });
  }

  // Only proceed with image processing if city is valid
  const imageUrl = file.path.replace(/\\/g, "/");
  const postData = {
    title,
    category,
    state,
    imageUrl,
    description,
    user: req.user,
    ...(month && { month }), // Adding parameters if present
    ...(city && { city }),
    ...(longitude && { longitude }),
    ...(latitude && { latitude }),
  };

  const post = new Post(postData);

  // We should also update user model
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

    return res.redirect("/user/dashboard?review=true");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); // Activated error middleware
  }
};

exports.getEditPost = async (req, res, next) => {
  const postID = req.params.postID;
  const post = await Post.findById(postID);
  if (!post) return res.redirect("/user/dashboard");

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
  const updatedMonth = +req.body.month ?? 0; // Convert to number with default
  const updatedCity = req.body.city;
  const file = req.file;
  const errors = validationResult(req);

  // Fetch the post
  let post;
  try {
    post = await Post.findById(postID);
    if (!post) return res.redirect("/user/dashboard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  // Initialize imageUrl
  let imageUrl = post.imageUrl; // Default to existing image

  // Handle file upload
  if (file) {
    imageUrl = file.path.replace(/\\/g, "/"); // Update image path

    // Delete old image file
    fs.unlink(
      path.join(__dirname, "..", ...post.imageUrl.split("/")),
      (err) => {
        if (err) console.log("Error in deleting = ", err);
      }
    );
  }

  // Update city and fetch coordinates if city has changed
  if (updatedCity && post.city !== updatedCity) {
    try {
      const coordinates = await getCoordinates(updatedCity);
      const [latitude = null, longitude = null] = coordinates || [];

      if (latitude === null || longitude === null) {
        return res.status(200).render("user/addPost", {
          pageTitle: "Edit Post",
          normal: false,
          dark: true,
          editing: true,
          errors: [
            {
              path: "city",
              msg: "Please add a valid city. (Try a more popular city)",
            },
          ],
          oldInput: {
            title: updatedTitle,
            category: updatedCategory,
            state: updatedState,
            description: updatedDescription,
            city: updatedCity,
            month: updatedMonth,
            imageUrl,
          },
          postID: postID,
        });
      }

      // Update post with new city and coordinates
      post.city = updatedCity;
      post.latitude = latitude;
      post.longitude = longitude;
    } catch (err) {
      return next(err);
    }
  }

  // Check validation errors
  if (!errors.isEmpty()) {
    return res.status(200).render("user/addPost", {
      pageTitle: "Edit Post",
      normal: false,
      dark: true,
      editing: true,
      errors: errors.array(),
      oldInput: {
        title: updatedTitle,
        category: updatedCategory,
        state: updatedState,
        description: updatedDescription,
        city: updatedCity,
        month: updatedMonth,
        imageUrl,
      },
      postID: postID,
    });
  }

  // Update post fields only if they are provided
  post.title = updatedTitle ?? post.title;
  post.category = updatedCategory ?? post.category;
  post.state = updatedState ?? post.state;
  post.description = updatedDescription ?? post.description;
  post.month = updatedMonth ?? post.month; // Optional
  post.imageUrl = imageUrl;

  try {
    await post.save();
    console.log("EDIT SUCCESSFUL");
    return res.redirect("/user/dashboard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); // Activate error middleware
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

  if (!post) return res.redirect("/user/dashboard");

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
    visible: req.user?._id.toString() === post.user.toString(),
  });
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postID);
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(401).json({ message: "You have to be logged in" });
    }
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let likes = post.likes ?? 0;
    let dislikes = post.dislikes ?? 0;
    let index = -1;

    if (user.likes.length > 0) {
      index = user.likes.findIndex(
        (like) => like.post.toString() === post._id.toString()
      );
    }

    if (index !== -1) {
      // User has already voted on this post
      if (user.likes[index].like) {
        // Already liked
        return res.status(200).json({
          message: "Already liked!",
          likes: likes,
          dislikes: dislikes,
        });
      } else if (user.likes[index].dislike) {
        // Toggle from dislike to like
        likes += 1;
        dislikes -= 1;
        user.likes[index] = { post: post._id, like: true, dislike: false };
      }
    } else {
      // User has not voted on this post
      likes += 1;
      user.likes.push({ post: post._id, like: true, dislike: false });
    }

    post.likes = likes;
    post.dislikes = dislikes;

    await post.save();
    await user.save();

    res.status(200).json({
      message: index !== -1 ? "Toggled from dislike to like" : "Post liked",
      likes: likes,
      dislikes: dislikes,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); // Activate error middleware
  }
};
exports.dislikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postID);
    const user = await User.findById(req.user);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let likes = post.likes ?? 0;
    let dislikes = post.dislikes ?? 0;
    const index = user.likes.findIndex(
      (like) => like.post.toString() === post._id.toString()
    );

    if (index !== -1) {
      // User has already voted on this post
      if (user.likes[index].dislike) {
        // Already disliked
        return res.status(200).json({
          message: "Already disliked!",
          likes: likes,
          dislikes: dislikes,
        });
      } else if (user.likes[index].like) {
        // Toggle from like to dislike
        likes -= 1;
        dislikes += 1;
        user.likes[index] = { post: post._id, like: false, dislike: true };
      }
    } else {
      // User has not voted on this post
      dislikes += 1;
      user.likes.push({ post: post._id, like: false, dislike: true });
    }

    post.likes = likes;
    post.dislikes = dislikes;

    await post.save();
    await user.save();

    res.status(200).json({
      message: index !== -1 ? "Toggled from like to dislike" : "Post disliked",
      likes: likes,
      dislikes: dislikes,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); // Activate error middleware
  }
};

exports.countRatings = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postID);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({
      message: "Ratings retrieved successfully",
      likes: post.likes,
      dislikes: post.dislikes,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); // Activate error middleware
  }
};
