const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.status(200).render("auth/login", {
    pageTitle: "Login",
    normal: false,
    dark: true,
    errors: [],
    oldInput: { username: "", password: "" },
  });
};

exports.postLogin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Sign Up",
      normal: false,
      dark: true,
      errors: errors.array(),
      oldInput: { username, password },
    });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      //If no user is returned
      return res.status(422).render("auth/login", {
        pageTitle: "Sign Up",
        normal: false,
        dark: true,
        errors: [{ msg: "Account does not exist!", path: "username" }],
        oldInput: { username, password },
      });
    }
    const isMatching = await bcryptjs.compare(password, user.password);

    if (!isMatching) {
      //Passwords do not match
      return res.status(422).render("auth/login", {
        pageTitle: "Sign Up",
        normal: false,
        dark: true,
        errors: [{ msg: "Incorrect Password", path: "password" }],
        oldInput: { username, password },
      });
    }
    //If passwords match, allow login
    // req.session.isLoggedIn = true;
    // req.session.user = user;
    console.log("LOGGED IN ", user);
    return res.redirect("/");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); //Activated error middleware
  }
};

exports.getSignUp = (req, res, next) => {
  res.status(200).render("auth/signup", {
    pageTitle: "Sign Up",
    normal: false,
    dark: true,
    errors: [],
    oldInput: { username: "", email: "", password: "", cnfPassword: "" },
  });
};

exports.postSignUp = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const cnfPassword = req.body.cnfPassword;
  const email = req.body.email;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign Up",
      normal: false,
      dark: true,
      errors: errors.array(),
      oldInput: { username, password, email, cnfPassword },
    });
  }
  const user = await User.findOne({ username });

  if (user) {
    //If user is already defined in the database
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign Up",
      normal: false,
      dark: true,
      errors: [{ msg: "User already exists.", path: "username" }],
      oldInput: { username, password, email, cnfPassword },
    });
  }
  try {
    const hashedPass = await bcryptjs.hash(password, 12);
    const user = new User({ username, email, password: hashedPass });
    await user.save();
    return res.status(201).redirect("/login"); //201 = Resource created
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); //Activated error middleware
  }
};
