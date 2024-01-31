const express = require("express");
const {
  sendRestEmail,
  resetPassword,
  submitNewPassword,
} = require("../controllers/resetPasswordController");
const router = express.Router();

router.post("/", sendRestEmail);
router.get("/:id/:token", resetPassword);
router.post("/:id/:token", submitNewPassword);

exports.router = router;
