import express from 'express';
import { uploadPhotoMiddleware, uploadAudioMiddleware } from '../middleware/uploadMiddleware.js';
import { uploadPhotoController, deletePhotoController, uploadAudioController, deleteAudioController } from '../controllers/mediaController.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Fotoğraf Yükleme Rotası: /api/media/box/:boxId/photo
// Multer middleware'i formdata içindeki 'photo' adlı dosyayı alıp Cloudinary'e yükler.
router.post('/box/:boxId/photo', uploadPhotoMiddleware.single('photo'), asyncHandler(uploadPhotoController));

// Fotoğraf Silme Rotası
router.delete('/box/:boxId/photo', asyncHandler(deletePhotoController));

// Ses Yükleme Rotası: /api/media/box/:boxId/audio
router.post('/box/:boxId/audio', uploadAudioMiddleware.single('audio'), asyncHandler(uploadAudioController));

// Ses Silme Rotası: /api/media/box/:boxId/audio
router.delete('/box/:boxId/audio', asyncHandler(deleteAudioController));

export default router;
