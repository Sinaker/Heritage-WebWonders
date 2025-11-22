const { validationResult } = require("express-validator");
const Post = require("../models/post");
const POSTS_PER_PAGE = 7;

exports.getDashboard = async (req, res, next) => {
  try {
    const request = req.query.request;
    const page = +req.query.page || 1;
    
    // Run count and find queries in parallel for better performance
    const [totalPosts, posts] = await Promise.all([
      Post.countDocuments({ isApproved: "pending" }),
      Post.find({ isApproved: "pending" })
        .select('title category state imageUrl description isApproved createdAt user')
        .sort({ createdAt: -1 })
        .skip((page - 1) * POSTS_PER_PAGE)
        .limit(POSTS_PER_PAGE)
        .lean()
        .exec()
    ]);

    res.status(200).render("user/dashboard", {
      pageTitle: "Darshan",
      normal: false,
      dark: true,
      username: "Admin",
      posts: posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / POSTS_PER_PAGE),
      request,
      totalPosts,
      accepted: req.session.approved || 0,
      rejected: req.session.rejected || 0,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); //Activated error middleware
  }
};

exports.getEditPost = async (req, res, next) => {
  const postID = req.params.postID;
  // Use lean() for read-only operations
  const post = await Post.findById(postID).lean();
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

exports.editAndAcceptPost = async (req, res, next) => {
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
    if (!post) return res.redirect("/");
    let imageUrl = "";

    if (file) {
      imageUrl = file.path.replace(/\\/g, "/"); //Only change path if file has an image
    }

    //Updating model
    post.title = updatedTitle;
    post.category = updatedCategory;
    post.state = updatedState;
    post.description = updatedDescription;
    post.isApproved = "true"; //This will be approved now

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

    req.session.approved = (req.session.approved || 0) + 1;
    console.log("POST HAS BEEN EDITED AND ACCEPTED!");

    return res.redirect("/admin/dashboard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = error.httpStatusCode || 500;
    next(error); //Activated error middleware
  }
};

exports.rejectPost = async (req, res, next) => {
  const postID = req.params.postID;
  
  // Use findByIdAndUpdate for atomic update - more efficient
  await Post.findByIdAndUpdate(postID, { isApproved: "false" });
  
  req.session.rejected = (req.session.rejected || 0) + 1;
  console.log("POST HAS BEEN REJECTED");

  res.redirect("/admin/dashboard");
};
