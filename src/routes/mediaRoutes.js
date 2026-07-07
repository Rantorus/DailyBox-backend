import express from 'express';
import { uploadPhotoMiddleware } from '../middleware/uploadMiddleware.js';
import { uploadPhotoController, deletePhotoController } from '../controllers/mediaController.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Fotoğraf Yükleme Rotası: /api/media/box/:boxId/photo
// Multer middleware'i formdata içindeki 'photo' adlı dosyayı alıp Cloudinary'e yükler.
router.post('/box/:boxId/photo', uploadPhotoMiddleware.single('photo'), asyncHandler(uploadPhotoController));

// Fotoğraf Silme Rotası: /api/media/box/:boxId/photo
// Body'den silinecek { url } gönderilir.
router.delete('/box/:boxId/photo', asyncHandler(deletePhotoController));

export default router;
