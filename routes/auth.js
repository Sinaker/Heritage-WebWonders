const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth");
const router = express.Router();

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    check("username")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Username must be more than 5 characters")
      .isAlphanumeric()
      .withMessage("Username must consist of alphanumeric characters"),
    check("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/^[a-zA-Z0-9_$]*$/)
      .withMessage(
        "Password can only contain letters, numbers, and special characters (_ and $)."
      ),
  ],
  authController.postLogin
);
router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  [
    check("username")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Username must be more than 5 characters")
      .isAlphanumeric()
      .withMessage("Username must consist of alphanumeric characters"),
    check("email", "Email must be a valid email")
      .trim()
      .isEmail()
      .normalizeEmail(),
    check("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/^[a-zA-Z0-9_$]*$/)
      .withMessage(
        "Password can only contain letters, numbers, and special characters (_ and $)."
      ),
    check("cnfPassword").custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match");

      return true;
    }),
  ],
  authController.postSignUp
);

module.exports = router;
