const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");

const errorController = require("./controllers/errorController");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const homeRoutes = require("./routes/home");
const exploreRoutes = require("./routes/explore");
const adminRoutes = require("./routes/admin");


const MONGODB_URI = process.env.MONGODB_CONNECTION; //Using env variables

const app = express();
app.set('trust proxy', true);
app.use(compression());
const store = new MongoDBStore({ uri: MONGODB_URI, databaseName: "test", collection: "session" });

app.use(bodyParser.urlencoded({ extended: false }));

// MULTER OPTIONS
const fileStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg" ||
		file.mimetype === "image/webp" 
	)
		cb(null, true);
	else cb(null, false);
};

app.set("view engine", "ejs"); // Using EJS as the template engine
app.set("views", "views"); // Express will look for views in the "views" directory


app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
		store: store,
	}),
);

const User = require("./models/user");

app.use(async (req, res, next) => {
	if (!req.session.user) {
		//If session does not exist, continue without loggedIn state
		return next();
	}
	try {
		// Only select fields we commonly need, use lean() for better performance
		const user = await User.findById(req.session.user._id)
			.select('username email isAdmin posts likes')
			.lean();
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
	res.locals.isLoggedIn = req.session.isLoggedIn || false;
	res.locals.isAdmin = req.session.user?.isAdmin || false;
	next();
}); //Such variables will be available to every rendered view


// MULTER + AZURE
const uploadMiddleware = multer({ storage: fileStorage, fileFilter: fileFilter, limits: {fileSize: 2000000} }).single("post_img");

app.use(uploadMiddleware); //Middleware for handling file uploads

app.use(authRoutes);
app.use(userRoutes);
app.use("/explore", exploreRoutes);
app.use("/admin", adminRoutes);
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
		app.listen(3000, '0.0.0.0'); // For Docker compatibility
		console.log(`Connected and on port ${process.env.PORT || 3000}`);
	})
	.catch((err) => {
		const error = new Error(err);
		error.httpStatusCode = 500;
		throw error;
	});
