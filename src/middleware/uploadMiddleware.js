import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Fotoğraflar için Storage ayarı
const photoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DailyBox_Photos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // Transformation ekleyebiliriz (opsiyonel)
    // transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
});

export const uploadPhotoMiddleware = multer({ storage: photoStorage });
