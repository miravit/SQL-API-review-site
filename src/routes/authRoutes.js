const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authControllers");
const {validate} = require("../middleware/validation/validationMiddleware")
const {registerSchema} = require("../middleware/validation/validationSchemas")


// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), register);

// POST /api/v1/auth/login
router.post("/login", login);

module.exports = router;
