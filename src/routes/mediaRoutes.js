import express from 'express';
import { uploadPhotoController, deletePhotoController, uploadAudioController, deleteAudioController, uploadDocController, deleteDocController } from '../controllers/mediaController.js';
import { uploadPhotoMiddleware, uploadAudioMiddleware, uploadDocMiddleware } from '../middleware/uploadMiddleware.js';
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

// Döküman Yükleme Rotası: /api/media/box/:boxId/doc
router.post('/box/:boxId/doc', uploadDocMiddleware.single('doc'), asyncHandler(uploadDocController));

// Döküman Silme Rotası: /api/media/box/:boxId/doc
router.delete('/box/:boxId/doc', asyncHandler(deleteDocController));

export default router;
