const express = require("express");
const router = express.Router();

const reviewRoutes = require("./reviewRoutes");
const userRoutes = require("./userRoutes");
const workshopRoutes = require("./workshopRoutes");
const authRoutes = require("./authRoutes");

router.use("/reviews", reviewRoutes);
router.use("/users", userRoutes);
router.use("/workshops", workshopRoutes);
router.use("/auth", authRoutes);

module.exports = router;
