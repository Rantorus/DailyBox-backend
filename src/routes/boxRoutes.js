import express from "express";
import { 
    createBox, 
    getAllBoxes,
    getBoxesByUserId, 
    getBoxById, 
    updateBox, 
    deleteBox,
    getBoxesByChapterId,
    uploadBoxMedia,
    deleteBoxMedia
} from "../controllers/boxController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js"; 
import { validateBox, validateBoxUpdate, validateMediaDelete } from "../middlewares/inputValidator.js";
import upload from "../middlewares/uploadMiddleware.js";

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

// ===================================
// MEDYA ROTALARI (Bulut Entegrasyonu)
// ===================================

// Kutuya Resim/Ses/Belge Yükleme
// upload.single("file") -> React Native bize dosyayı "file" anahtarı içinde veya "photo", "audio" vs içinde atabilir
// Ama uploadMiddleware içinde fieldname'e göre ayırdığımız için buraya genel bir isimle gelse bile çalışır,
// ancak postman'de key olarak "photo", "audio", veya "doc" kullanacağız.
// NOT: upload.any() diyerek key ismini esnetebiliriz. Böylece frontend'den gelen fieldname'i yakalarız.
router.post("/:id/media", upload.any(), uploadBoxMedia);

// Kutudan Resim/Ses/Belge Silme
router.delete("/:id/media", validateMediaDelete, deleteBoxMedia);

export default router;
