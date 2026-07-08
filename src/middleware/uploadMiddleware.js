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

// Belgeler (Docs) için Storage ayarı
const docStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Uzantıyı ve adı alıyoruz
    let filename = file.originalname || `doc_${Date.now()}`;
    if (filename.includes('.')) {
        filename = filename.split('.').slice(0, -1).join('.');
    }
    return {
      folder: 'DailyBox_Docs',
      resource_type: 'raw', // Dökümanlar için 'raw' ZORUNLUDUR
      public_id: filename
      // allowed_formats kısmını koymuyoruz ki her türlü dökümanı kabul etsin (Frontend uzantı sorunları için çözüm)
    };
  },
});

export const uploadDocMiddleware = multer({ storage: docStorage });

// Avatar için Storage ayarı
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'DailyBox_Avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }] // Yüzü merkeze alarak kare yap
  },
});

export const uploadAvatarMiddleware = multer({ storage: avatarStorage });
