import express from "express";
import { 
    createChapter, 
    getAllChapters, 
    getChapterById, 
    getChaptersByUserId, 
    updateChapter, 
    deleteChapter 
} from "../controllers/chapterController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js"; 
import { validateChapter } from "../middlewares/inputValidator.js"; // DÜZELTME: Joi kontrolümüzü import ettik

const router = express.Router();

// GÜVENLİK DUVARI
// Tüm chapter rotaları artık sadece token'ı olanlara açık.
router.use(validateToken);

// Yeni chapter oluşturma (POST) - Sadece düzgün veri yollayanlar girebilir
router.post("/", validateChapter, createChapter);

// Kullanıcının kendi chapter'larını getirme (GET)
router.get("/", getChaptersByUserId);

// Admin için tüm chapter'ları getirme (GET)
router.get("/all", getAllChapters);

// Tek bir chapter getirme (GET)
router.get("/:id", getChapterById);

// Chapter güncelleme (PUT) - Güncellenecek veri de düzgün olmalı
router.put("/:id", validateChapter, updateChapter);

// Chapter silme (DELETE)
router.delete("/:id", deleteChapter);

export default router;