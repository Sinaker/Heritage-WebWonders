const express = require("express");
const router = express.Router();

const exploreController = require("../controllers/explore");

router.get("/festivals", exploreController.getFestivals);

router.get("/posts", exploreController.getPosts);
router.get("/posts/filter", exploreController.applyFilters);

// router.get("/post", exploreController.getPosts);

module.exports = router;
