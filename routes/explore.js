const express = require("express");
const router = express.Router();

const exploreController = require("../controllers/explore");

router.get("/festivals", exploreController.getFestivals);

module.exports = router;
