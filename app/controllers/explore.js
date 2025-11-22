const Post = require("../models/post");

const POSTS_PER_PAGE = 20;

exports.getFestivals = async (req, res, next) => {
  const festivalPosts = Array.from({ length: 12 }, () => []);
  // Use lean() for faster queries when we don't need mongoose documents
  const posts = await Post.find({
    category: "festival",
    isApproved: "true",
  })
  .select('title category month state imageUrl description createdAt')
  .lean()
  .exec();

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
  const page = +req.query.page || 1;
  
  // Use lean() and select only needed fields
  const posts = await Post.find({ isApproved: "true" })
    .populate("user", "username")
    .select('title category state imageUrl description user createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * POSTS_PER_PAGE)
    .limit(POSTS_PER_PAGE)
    .lean()
    .exec();
  
  const totalPosts = await Post.countDocuments({ isApproved: "true" });
  
  res.render("allPosts", {
    pageTitle: "Explore Posts",
    normal: false,
    dark: true,
    posts: posts,
    filter: false,
    filters: { state: "all", category: "all" },
    currentPage: page,
    totalPages: Math.ceil(totalPosts / POSTS_PER_PAGE),
  });
};
exports.applyFilters = async (req, res, next) => {
  try {
    const { category, state, sort } = req.query;
    const page = +req.query.page || 1;

    // Build the query object
    let query = { isApproved: "true" };
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
      case "revalpha":
        sortOrder = { title: -1 }; // Order by Name (Z-A)
        break;
      default:
        sortOrder = { createdAt: -1 }; // Default to newest first
    }

    // Fetch the posts from the database with pagination
    const posts = await Post.find(query)
      .sort(sortOrder)
      .populate("user", "username")
      .select('title category state imageUrl description user createdAt')
      .skip((page - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE)
      .lean()
      .exec();
    
    const totalPosts = await Post.countDocuments(query);
    
    res.render("allPosts", {
      pageTitle: "Explore Posts",
      normal: false,
      dark: true,
      posts: posts,
      filter: true,
      filters: { state, category },
      currentPage: page,
      totalPages: Math.ceil(totalPosts / POSTS_PER_PAGE),
    });
  } catch (err) {
    console.error(err);
    err.statusCode = 500;
    next(err);
  }
};

exports.getStateMap = async (req, res, next) => {
  // Use lean() and select only fields needed for the map
  const posts = await Post.find({
    category: { $ne: "festival" },
    isApproved: "true",
  })
  .select('title state city imageUrl latitude longitude description')
  .lean()
  .exec();
  
  res.status(200).render("map", {
    pageTitle: "Explore By State",
    normal: false,
    dark: true,
    posts,
  });
};
