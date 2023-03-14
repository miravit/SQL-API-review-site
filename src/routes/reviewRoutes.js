const express = require("express");
const router = express.Router();
const { validate } = require("../middleware/validation/validationMiddleware");
const { reviewSchema } = require("../middleware/validation/validationSchemas");
const { isAuthenticated } = require("../middleware/authenticationMiddleware");
const {
  getReviewById,
  createNewReview,
  updateReviewById,
  deleteReviewById,
} = require("../controllers/reviewControllers");

// GET - /api/v1/reviews/:reviewId
router.get("/:reviewId", getReviewById);

// POST - /api/v1/reviews/
router.post("/", isAuthenticated, validate(reviewSchema), createNewReview);

// PUT - /api/v1/reviews/:reviewId
router.put("/:reviewId", isAuthenticated, updateReviewById);

// DELETE - /api/v1/reviews/:reviewId
router.delete("/:reviewId", isAuthenticated, deleteReviewById);

module.exports = router;
