const express = require("express");
const { isLoggedIn } = require("../middleware/isLoggedIn");

const router = express.Router();
const homeController = require("../controllers/home");
const { check } = require("express-validator");
router.get("/", homeController.getHome);

//USER ROUTERS

router.get("/user/dashboard", isLoggedIn, homeController.getDashboard);
router.get("/user/add-post", isLoggedIn, homeController.getAddPost);

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
  homeController.postAddPost
);

router.get("/user/edit-post/:postID", homeController.getEditPost);

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
  homeController.postEditPost
);

router.post("/delete/post/:postID", homeController.deletePost);

module.exports = router;
