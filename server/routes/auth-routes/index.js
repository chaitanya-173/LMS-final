const express = require("express");
const router = express.Router();
const { registerUser, loginUser, checkAuth } = require("../../controllers/auth-controller");
const authenticate = require("../../middlewares/auth-middleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-auth", authenticate, checkAuth);

module.exports = router;
