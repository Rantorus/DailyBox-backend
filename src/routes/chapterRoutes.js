import express from "express";

const router = express.Router();

router.post("/", createChapter);
router.get("/", getAllChapters);

router.get("/:id", getChapterById);
router.post("/:id", getChaptersByUserId);
router.post("/:id", updateChapter);
router.post("/:id", deleteChapter);

export default router;