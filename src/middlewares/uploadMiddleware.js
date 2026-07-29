import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js";

// Cloudinary Storage Ayarları
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => {
            if (file.fieldname === 'photo') return 'dailybox_photos';
            if (file.fieldname === 'audio') return 'dailybox_audio';
            if (file.fieldname === 'doc') return 'dailybox_docs';
            return 'dailybox_others';
        },
        resource_type: 'auto',
    },
});

// Multer Dosya Filtresi (Güvenlik Duvarı)
const fileFilter = (req, file, cb) => {
    let allowedFormats = [];
    
    if (file.fieldname === "photo") {
        allowedFormats = ["jpg", "png", "jpeg", "webp"];
    } else if (file.fieldname === "audio") {
        allowedFormats = ["mp3", "wav", "m4a", "mp4", "ogg", "aac"];
    } else if (file.fieldname === "doc") {
        allowedFormats = ["pdf", "txt", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "rtf"];
    }

    // Dosyanın orijinal adından uzantısını çıkar (örn: 'sunum.pptx' -> 'pptx')
    const ext = file.originalname.split('.').pop().toLowerCase();
    
    if (allowedFormats.includes(ext)) {
        cb(null, true); // İzin ver
    } else {
        cb(new Error(`Desteklenmeyen dosya formatı: ${ext}. Sadece izin verilen formatlar yüklenebilir.`), false); // Reddet
    }
};

// Multer Middleware'i
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});

export default upload;
