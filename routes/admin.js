const express = require("express");

const router = express.Router();
const adminController = require("../controllers/admin");
const { isAdmin } = require("../middleware/isLoggedIn");
const { check } = require("express-validator");

router.get("/dashboard", isAdmin, adminController.getDashboard);
router.get("/edit-post/:postID", isAdmin, adminController.getEditPost);

router.post(
  "/edit-post/:postID",
  isAdmin,
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
  adminController.editAndAcceptPost
);

router.post("/reject/post/:postID", adminController.rejectPost);

module.exports = router;
