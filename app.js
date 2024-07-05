const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/errorController");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

//Express serves these contents as if they were in the root
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

app.get("/", (req, res, next) => {
  res.status(404).render("heropage", { pageTitle: "Darshan", path: "/" });
});

app.use(errorController.get404);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
