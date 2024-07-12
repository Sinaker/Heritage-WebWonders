const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/errorController");

const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");

const MONGODB_URI = process.env.MONGODB_CONNECTION; //Using env variables

const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collection: "session" });

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

//Express serves these contents as if they were in the root
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const User = require("./models/user");

app.use(async (req, res, next) => {
  if (!req.session.user) {
    //If session does not exist, continue without loggedIn state
    return next();
  }
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return next();
    req.user = user; //Trying to associate user with the req object
    next();
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); //Activated error middleware
  }
});

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  next();
}); //Such variables will be available to every rendered view

app.use(authRoutes);
app.use(homeRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Internal Error",
    path: "/500",
    isAdmin: false,
    normal: false,
    dark: true,
  });
}); //Special Error middleware

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
    console.log("Server is running on port 3000");
  })
  .catch((err) => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error); //Activated error middleware
  });
