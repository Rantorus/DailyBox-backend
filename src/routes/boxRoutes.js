import express from "express";
import { 
    createBox, 
    getAllBoxes,
    getBoxesByUserId, 
    getBoxById, 
    updateBox, 
    deleteBox,
    getBoxesByChapterId 
} from "../controllers/boxController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js"; 
import { validateBox, validateBoxUpdate } from "../middlewares/inputValidator.js";

const router = express.Router();

// GÜVENLİK DUVARI
// Tüm box rotaları sadece geçerli token'ı olanlara açık
router.use(validateToken);

// Yeni serbest kutu oluşturma (POST) - title ve date zorunlu
router.post("/", validateBox, createBox);

// Kullanıcının kendi kutularını getirme (GET)
router.get("/", getBoxesByUserId);

// Admin için tüm kutuları getirme (GET)
router.get("/all", getAllBoxes);

// Bir kitaba (chapter) ait kutuları getirme (GET)
router.get("/chapter/:chapterId", getBoxesByChapterId);

// Tek bir kutu getirme (GET)
router.get("/:id", getBoxById);

// Kutu güncelleme / Not ekleme / Lokasyon ekleme (PATCH) 
// Sadece gönderilen alanları doğrular
router.patch("/:id", validateBoxUpdate, updateBox);

// Kutu silme (DELETE)
router.delete("/:id", deleteBox);

export default router;
