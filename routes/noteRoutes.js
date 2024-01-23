const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();
const {
  getNotes,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

router.use(protect);
router.get("/", getNotes);
router.post("/create", createNote);
router.get("/:id", getNoteById);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

exports.router = router;
