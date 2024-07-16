const Post = require("../models/post");

exports.getFestivals = async (req, res, next) => {
  const festivalPosts = Array.from({ length: 12 }, () => []);
  const posts = await Post.find({ category: "festival" });

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
