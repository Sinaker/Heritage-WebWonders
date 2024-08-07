const express = require("express");

const router = express.Router();

const homeController = require("../controllers/home");

router.get("/", homeController.getHome);

router.post("/send/subscription", homeController.sendSub);
router.get("/about", homeController.getAbout);
router.get("/contribute", homeController.getContribute);

module.exports = router;
