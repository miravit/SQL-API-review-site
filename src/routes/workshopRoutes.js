const express = require("express");
const router = express.Router();
const {
  getAllWorkshops,
  getWorkshopById,
  createNewWorkshop,
  updateWorkshopById,
  deleteWorkshopById,
} = require("../controllers/workshopControllers");

const { isAuthenticated } = require("../middleware/authenticationMiddleware");

const { validate } = require("../middleware/validation/validationMiddleware");
const {
  workshopSchema,
} = require("../middleware/validation/validationSchemas");

// GET - /api/v1/workshops
router.get("/", getAllWorkshops);

// GET - /api/v1/workshops/:workshopId
router.get("/:workshopId", getWorkshopById);

// POST - /api/v1/workshops
router.post("/", isAuthenticated, validate(workshopSchema), createNewWorkshop);

// PUT - /api/v1/workshops/:workshopId
router.put("/:workshopId", isAuthenticated, updateWorkshopById);

// DELETE - /api/v1/workshops/:workshopId
router.delete("/:workshopId", isAuthenticated, deleteWorkshopById);

module.exports = router;
