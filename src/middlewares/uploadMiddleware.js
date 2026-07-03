import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js";

// Cloudinary Storage Ayarları
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // 1. Orijinal dosya uzantısını alıyoruz
        const ext = file.originalname.split('.').pop().toLowerCase();
        
        let folderName = "dailybox_misc";
        let resourceType = "auto";
        
        // 2. Gelen dosyanın türüne göre (form'daki 'fieldname') klasör ve tip seçimi
        if (file.fieldname === "photo") {
            folderName = "dailybox_photos";
            resourceType = "image";
        } 
        else if (file.fieldname === "audio") {
            folderName = "dailybox_audio";
            resourceType = "video"; // Ses dosyaları Cloudinary'de video altyapısıyla saklanır
        } 
        else if (file.fieldname === "doc") {
            folderName = "dailybox_docs";
            // Cloudinary varsayılan güvenlik ayarlarında PDF'lerin 'image' olarak görüntülenmesini engeller (401 hatası verir).
            // Bu yüzden PDF dahil tüm dokümanları 'raw' (ham) olarak tutmalıyız.
            resourceType = "raw"; 
        }

        // 3. Cloudinary Parametreleri
        const params = {
            folder: folderName,
            resource_type: resourceType,
        };

        // 4. Uzantı Ayarları
        // Cloudinary 'raw' dosyalarda format parametresini bazen bozabilir.
        // Bu yüzden formatı sadece resim (pdf dahil) ve ses dosyaları için ekliyoruz.
        // Raw dosyalar Cloudinary tarafından zaten otomatik olarak kendi uzantılarıyla kaydedilir (public_id üzerinden).
        if (resourceType !== "raw") {
            params.format = ext;
        } else {
            // Raw dosyalar için uzantının kaybolmaması adına public_id'nin sonuna uzantıyı manuel ekliyoruz.
            // Dosyanın asıl adını boşluklardan temizleyip birleştiriyoruz.
            const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
            params.public_id = `${cleanName}_${Date.now()}.${ext}`;
        }

        return params;
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
