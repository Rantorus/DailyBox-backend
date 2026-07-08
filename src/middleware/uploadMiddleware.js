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

// Sesler için Storage ayarı (Cloudinary ses dosyalarını video olarak yönetir)
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Dosya uzantısını atıp adını alıyoruz ki public_id olarak kullanalım (Eğer uzantı yoksa direkt adı kullan)
    let filename = file.originalname || `audio_${Date.now()}`;
    if (filename.includes('.')) {
        filename = filename.split('.').slice(0, -1).join('.');
    }
    return {
      folder: 'DailyBox_Audio',
      resource_type: 'video', // Çok önemli: Audio için video kullanılır
      allowed_formats: ['mp3', 'wav', 'aac', 'm4a', 'mp4', '3gp', '3gpp', 'ogg', 'webm'],
      public_id: filename // Kendi ismimizi kullanmasını sağlıyoruz
    };
  },
});

export const uploadAudioMiddleware = multer({ storage: audioStorage });
