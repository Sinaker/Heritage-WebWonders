const express = require("express");
const { check } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");
const router = express.Router();

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    check("username")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Username must be more than 5 characters")
      .matches(/^[a-zA-Z0-9_.]+$/)
      .withMessage("Username can only contain letters, numbers, _ and .")
      .matches(/(.*[a-zA-Z].*){3,}/)
      .withMessage("The Username must contain at least 3 letters"),
    check("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/^[a-zA-Z0-9!@#$^&*\s]+$/)
      .withMessage(
        "Password can only contain letters, numbers, spaces, and the symbols (!@#$^&*)"
      )
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$^&*]/)
      .withMessage("Password must contain at least one symbol from !@#$^&*"),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  [
    check("username")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Username must be more than 5 characters")
      .matches(/^[a-zA-Z0-9_.]+$/)
      .withMessage("Username can only contain letters, numbers, _ and .")
      .matches(/(.*[a-zA-Z].*){3,}/)
      .withMessage("The Username must contain at least 3 letters"),
    check("email", "Email must be a valid email")
      .trim()
      .isEmail()
      .normalizeEmail(),
    check("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/^[a-zA-Z0-9!@#$^&*\s]+$/)
      .withMessage(
        "Password can only contain letters, numbers, spaces, and the symbols (!@#$^&*)"
      )
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$^&*]/)
      .withMessage("Password must contain at least one symbol from !@#$^&*"),
    check("cnfPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  authController.postSignUp
);

router.get("/resetpassword", authController.getResetPass);
router.post(
  "/resetpassword",
  [
    check("username")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Username field cannot be empty")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
          throw new Error("User does not exist!");
        }
        return true;
      }),
  ],
  authController.postResetPass
);

router.get("/setpassword/:token", authController.getNewPass);
router.post(
  "/setpassword",
  [
    check("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/^[a-zA-Z0-9!@#$^&*\s]+$/)
      .withMessage(
        "Password can only contain letters, numbers, spaces, and the symbols (!@#$^&*)"
      )
      .matches(/[a-zA-Z]/)
      .withMessage("Password must contain at least one letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[!@#$^&*]/)
      .withMessage("Password must contain at least one symbol from !@#$^&*"),
  ],
  authController.postNewPass
);

module.exports = router;
