const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/errorController");
const authRoutes = require("./routes/auth");

const MONGODB_URI = process.env.MONGODB_CONNECTION; //Using env variables

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

//Express serves these contents as if they were in the root
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

const User = require("./models/user");
const mongoose = require("mongoose");

app.use(authRoutes);

app.get("/", (req, res, next) => {
  res
    .status(200)
    .render("heropage", { pageTitle: "Darshan", normal: false, dark: false });
});

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
