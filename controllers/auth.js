const path = require("path");

const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const ejs = require("ejs");
const nodemailer = require("nodemailer");

const p = path.join(__dirname, "..", "views", "templates");

let reset = null,
  account = null;

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_KEY,
  },
});

exports.getLogin = (req, res, next) => {
  const reset = req.query.reset;
  const account = req.query.account;
  res.status(200).render("auth/login", {
    pageTitle: "Login",
    normal: false,
    dark: true,
    errors: [],
    oldInput: { username: "", password: "" },
    reset: reset,
    account: account,
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
      reset: null,
      account: null,
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
        reset: null,
        account: null,
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
        reset: null,
        account: null,
      });
    }
    //If passwords match, use sessions to make logins persis
    req.session.isLoggedIn = true;
    req.session.user = user;
    await req.session.save(); //Save user session

    console.log("LOGGED IN SUCCESSFUL");
    return res.redirect("/?login=true");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); //Activated error middleware
  }
};

exports.postLogout = (req, res, next) => {
  //Delete session
  req.session.destroy(() => {
    res.redirect("/");
  });
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
    return res.status(201).redirect("/login?account=true"); //201 = Resource created
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); //Activated error middleware
  }
};

exports.getResetPass = (req, res, next) => {
  const error = req.query.error;
  const errorMsg = req.query.errorMsg;

  if (error) {
    return res.render("auth/resetpass", {
      path: "/resetpassword",
      pageTitle: "Reset Your Password",
      normal: false,
      dark: true,
      errorHeading: error,
      errors: [{ msg: errorMsg ? errorMsg : "" }],
    });
  }
  res.render("auth/resetpass", {
    path: "/resetpassword",
    pageTitle: "Reset Your Password",
    normal: false,
    dark: true,
    errors: [],
  });
};

exports.postResetPass = async (req, res, next) => {
  const errors = validationResult(req);
  const username = req.body.username;

  if (!errors.isEmpty()) {
    return res.render("auth/resetpass", {
      path: "/resetpassword",
      pageTitle: "Reset Your Password",
      normal: false,
      dark: true,
      errorHeading: "Invalid Username",
      errors: errors.array(),
    });
  }

  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return res.render("auth/resetpass", {
        path: "/resetpassword",
        pageTitle: "Reset Your Password",
        normal: false,
        dark: true,
        errorHeading: "Internal Error",
        errors: [{ msg: "Something went wrong!" }],
      });
    }

    const token = buffer.toString("hex");

    try {
      const user = await User.findOne({ username });

      //Generating token
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30min in milliseconds
      await user.save();

      res.redirect("/?mailSent=true");

      const emailData = {
        username: user.username,
        resetLink: `http://localhost:3000/setpassword/${token}`,
      };

      const html = await ejs.renderFile(
        path.join(p, "forgotPass.ejs"),
        emailData
      );
      const mailOptions = {
        from: {
          name: "Darshan support",
          address: process.env.SENDER,
        },
        to: user.email, // Send the email to the user's email address
        subject: "Password Recovery for Darshan",
        html: html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent " + info.response);
    } catch (err) {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error); // Activated error middleware
    }
  });
};

exports.getNewPass = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    }); //Checks current token and expiration date

    if (!user) {
      return res
        .status(401)
        .redirect(
          "/resetpassword?error=Session%20Expired&errorMsg=Please%20Try%20Again"
        );
    }

    //All credentials are valid
    return res.render("auth/setpass", {
      path: "/setpassword",
      pageTitle: "Set your new Password",
      normal: false,
      dark: true,
      userID: user._id.toString(),
      resetToken: token,
      errors: [],
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); // Activated error middleware
  }
};

exports.postNewPass = async (req, res, next) => {
  const token = req.body.resetToken;
  const userID = req.body.userID;
  const newPass = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/setpass", {
      path: "/setpassword",
      errors: errors.array(),
      errorHeading: "Invalid Password",
      userID: userID,
      resetToken: token,
    });
  }

  try {
    const user = await User.findOne({
      _id: userID,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.redirect("/resetpassword?error=");
    }
    const hashedPass = await bcryptjs.hash(newPass, 12);

    user.password = hashedPass;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.redirect("/login?reset=true");
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); // Activated error middleware
  }
};
