const express = require("express");

const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  registerUser,
  authUser,
  updateUserProfile,
} = require("../controllers/userControllers");

router.post("/", registerUser);
router.post("/login", authUser);

// router.use(protect).post("/profile", updateUserProfile);

router.use(protect);
router.post("/profile", updateUserProfile);

exports.router = router;
