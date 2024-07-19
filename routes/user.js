const express = require("express");
const { isLoggedIn } = require("../middleware/isLoggedIn");

const router = express.Router();
const userController = require("../controllers/user");
const { check } = require("express-validator");

//USER ROUTERS

router.get("/user/dashboard", isLoggedIn, userController.getDashboard);
router.get("/user/add-post", isLoggedIn, userController.getAddPost);

router.post(
  "/user/add-post",
  isLoggedIn,
  [
    check("title")
      .trim()
      .notEmpty()
      .withMessage(`Title must not be empty`)
      .matches(/^[A-Za-z\s]+$/)
      .withMessage(`Title must contain only alphabetic characters`),

    check("category").custom((value, { req }) => {
      if (!value) throw new Error("Please select category");
      else return true;
    }),
    check("month").custom((value, { req }) => {
      if (req.body.category === "festival" && !value) {
        throw new Error("Please select Month");
      } else return true;
    }),
    check("state").custom((value, { req }) => {
      if (!value) throw new Error("Please select State");
      else return true;
    }),
    check("description", "Description should be between 10 and 400 characters")
      .trim()
      .isLength({ min: 10, max: 400 }),
  ],
  userController.postAddPost
);

router.get("/user/edit-post/:postID", userController.getEditPost);

router.post(
  "/user/edit-post/:postID",
  isLoggedIn,
  [
    check("title")
      .trim()
      .notEmpty()
      .withMessage(`Title must not be empty`)
      .matches(/^[A-Za-z\s]+$/)
      .withMessage(`Title must contain only alphabetic characters`),

    check("description", "Description should be between 10 and 400 characters")
      .trim()
      .isLength({ min: 10, max: 400 }),

    check("category").custom((value, { req }) => {
      if (!value) throw new Error("Please select category");
      else return true;
    }),
    check("state").custom((value, { req }) => {
      if (!value) throw new Error("Please select State");
      else return true;
    }),
  ],
  userController.postEditPost
);

router.post("/delete/post/:postID", userController.deletePost);

router.get("/user/post/:postID", userController.getDetails);

router.get("/posts/:postID/ratings", userController.countRatings);

router.post("/user/:postID/like", userController.likePost);
router.post("/user/:postID/dislike", userController.dislikePost);

module.exports = router;
