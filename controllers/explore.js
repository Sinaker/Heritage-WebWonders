const Post = require("../models/post");

exports.getFestivals = async (req, res, next) => {
  const festivalPosts = Array.from({ length: 12 }, () => []);
  const posts = await Post.find({
    category: "festival",
    isApproved: "true",
  });

  // Populate the nested array
  posts.forEach((post) => {
    const monthIndex = post.month - 1; // Assuming each document has a 'month' field with numeric value
    if (monthIndex >= 0 && monthIndex < 12) {
      festivalPosts[monthIndex].push(post);
    }
  });
  res.render("festivals", {
    pageTitle: "Explore Festivals",
    normal: false,
    dark: true,
    festivals: festivalPosts,
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

exports.getPosts = async (req, res, next) => {
  const posts = await Post.find({ isApproved: "true" })
    .populate("user", "username")
    .exec();
  res.render("allPosts", {
    pageTitle: "Explore Posts",
    normal: false,
    dark: true,
    posts: posts,
    filter: false,
    filters: { state: "all", category: "all" },
  });
};
exports.applyFilters = async (req, res, next) => {
  try {
    const { category, state, sort } = req.query;

    // Build the query object
    let query = {};
    if (category && category !== "all") {
      query.category = category;
    }
    if (state && state !== "all") {
      query.state = state;
    }

    // Determine the sort order
    let sortOrder;
    switch (sort) {
      case "old":
        sortOrder = { createdAt: 1 }; // Oldest First
        break;
      case "new":
        sortOrder = { createdAt: -1 }; // Newest First
        break;
      case "alpha":
        sortOrder = { title: 1 }; // Order by Name (A-Z)
        break;
      case "rev-alpha":
        sortOrder = { title: -1 }; // Order by Name (Z-A)
        break;
      default:
        sortOrder = {}; // No sorting
    }

    // Fetch the posts from the database
    const posts = await Post.find(query)
      .sort(sortOrder)
      .populate("user", "username")
      .exec();
    res.render("allPosts", {
      pageTitle: "Explore Posts",
      normal: false,
      dark: true,
      posts: posts,
      filter: true,
      filters: { state, category },
    });
  } catch (err) {
    console.error(err);
    err.statusCode = 500;
    next(err);
  }
};

exports.getStateMap = async (req, res, next) => {
  const posts = await Post.find({
    category: { $ne: "festival" },
    isApproved: "true",
  });
  res.status(200).render("map", {
    pageTitle: "Explore By State",
    normal: false,
    dark: true,
    posts,
  });
};
