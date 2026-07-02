import express from "express";
import { 
    createChapter, 
    getAllChapters, 
    getChapterById, 
    getChaptersByUserId, 
    updateChapter, 
    deleteChapter,
    addBoxToChapter,
    removeBoxFromChapter,
    checkBoxInChapter
} from "../controllers/chapterController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js"; 
import { validateChapter } from "../middlewares/inputValidator.js";

const router = express.Router();

// GÜVENLİK DUVARI
router.use(validateToken);

// Yeni chapter oluşturma (POST)
router.post("/", validateChapter, createChapter);

// Kullanıcının kendi chapter'larını getirme (GET)
router.get("/", getChaptersByUserId);

// Admin için tüm chapter'ları getirme (GET)
router.get("/all", getAllChapters);

// Tek bir chapter getirme (GET)
router.get("/:id", getChapterById);

// Chapter güncelleme (PUT)
router.put("/:id", validateChapter, updateChapter);

// Chapter silme (DELETE)
router.delete("/:id", deleteChapter);

// ===================================
// KUTU BAĞLAMA İŞLEMLERİ (Many-to-Many)
// ===================================
// Kutu ekle
router.post("/:id/boxes", addBoxToChapter);
// Kutu çıkar
router.delete("/:id/boxes/:boxId", removeBoxFromChapter);
// Kutu kontrolü
router.get("/:id/boxes/:boxId", checkBoxInChapter);

export default router;