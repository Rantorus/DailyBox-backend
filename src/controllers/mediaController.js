import { addMediaToBoxService, removeMediaFromBoxService } from '../models/boxModel.js';
import cloudinary from '../config/cloudinary.js';

// Fotoğraf Yükleme Controller'ı
export const uploadPhotoController = async (req, res) => {
    try {
        const { boxId } = req.params;

        // Multer çalıştıysa dosya bilgileri req.file içindedir
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Photo file could not be uploaded." });
        }

        // Cloudinary'nin bize döndüğü güvenli URL
        const photoUrl = req.file.path;
        
        // Form verisinden orijinal display name gelmişse onu kullan
        const originalName = req.body.displayName || req.file.originalname || `photo_${Date.now()}.jpg`;

        // Veritabanına JSON objesi olarak ekle
        const mediaObj = { url: photoUrl, name: originalName };
        const updatedBox = await addMediaToBoxService(boxId, 'photo', mediaObj);

        res.status(200).json({
            success: true,
            message: "Fotoğraf başarıyla yüklendi.",
            data: updatedBox.media_photos // Sadece fotoğraflar dizisini dönebiliriz
        });

    } catch (error) {
        console.error("Fotoğraf yükleme hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};

// Fotoğraf Silme Controller'ı
export const deletePhotoController = async (req, res) => {
    try {
        const { boxId } = req.params;
        const { url } = req.body; // Silinecek fotoğrafın URL'i

        if (!url) {
            return res.status(400).json({ success: false, message: "Silinecek URL belirtilmedi." });
        }

        // 1. Cloudinary'den silme işlemi
        // URL'den public_id'yi çıkarma: 
        // Örnek URL: https://res.cloudinary.com/djv43df/image/upload/v1234/DailyBox_Photos/abcde123.jpg
        // public_id: DailyBox_Photos/abcde123
        try {
            const urlParts = url.split('/');
            const folderAndFile = urlParts.slice(urlParts.length - 2).join('/'); // DailyBox_Photos/abcde123.jpg
            const publicId = folderAndFile.split('.')[0]; // DailyBox_Photos/abcde123
            
            await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
            console.error("Cloudinary'den silinirken hata oldu, ama DB'den silmeye devam ediyoruz:", cloudinaryError);
        }

        // 2. Veritabanından silme işlemi
        const updatedBox = await removeMediaFromBoxService(boxId, 'photo', url);

        res.status(200).json({
            success: true,
            message: "Fotoğraf başarıyla silindi.",
            data: updatedBox.media_photos
        });

    } catch (error) {
        console.error("Fotoğraf silme hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};

// Ses (Audio) Yükleme Controller'ı
export const uploadAudioController = async (req, res) => {
    try {
        const { boxId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Ses dosyası yüklenemedi." });
        }

        const audioUrl = req.file.path;
        
        const originalName = req.body.displayName || req.file.originalname || `audio_${Date.now()}.m4a`;
        
        // Veritabanına JSON objesi olarak ekle
        const mediaObj = { url: audioUrl, name: originalName };
        const updatedBox = await addMediaToBoxService(boxId, 'audio', mediaObj);

        res.status(200).json({
            success: true,
            message: "Ses dosyası başarıyla yüklendi.",
            data: updatedBox.media_audio
        });

    } catch (error) {
        console.error("Ses yükleme hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};

// Ses (Audio) Silme Controller'ı
export const deleteAudioController = async (req, res) => {
    try {
        const { boxId } = req.params;
        const { url } = req.body; 

        if (!url) {
            return res.status(400).json({ success: false, message: "Silinecek URL belirtilmedi." });
        }

        // 1. Cloudinary'den silme işlemi
        try {
            const urlParts = url.split('/');
            const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
            const publicId = folderAndFile.split('.')[0]; 
            
            // SES SİLERKEN resource_type: 'video' ZORUNLUDUR!
            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        } catch (cloudinaryError) {
            console.error("Cloudinary'den silinirken hata oldu (Audio):", cloudinaryError);
        }

        // 2. Veritabanından silme işlemi
        const updatedBox = await removeMediaFromBoxService(boxId, 'audio', url);

        res.status(200).json({
            success: true,
            message: "Ses dosyası başarıyla silindi.",
            data: updatedBox.media_audio
        });

    } catch (error) {
        console.error("Ses silme hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};

// Döküman (Doc) Yükleme Controller'ı
export const uploadDocController = async (req, res) => {
    try {
        const { boxId } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Döküman dosyası yüklenemedi." });
        }

        const docUrl = req.file.path;
        const originalName = req.body.displayName || req.file.originalname || `doc_${Date.now()}`;
        
        // Veritabanına JSON objesi olarak ekle
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const mediaObj = { 
            url: docUrl, 
            name: originalName, 
            size: req.file.size || req.file.bytes, // Cloudinary bytes olarak da döndürebilir
            date: dateStr 
        };
        const updatedBox = await addMediaToBoxService(boxId, 'doc', mediaObj);

        res.status(200).json({
            success: true,
            message: "Döküman başarıyla yüklendi.",
            data: updatedBox.media_docs
        });

    } catch (error) {
        console.error("Döküman yükleme hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};

// Döküman (Doc) Silme Controller'ı
export const deleteDocController = async (req, res) => {
    try {
        const { boxId } = req.params;
        const { url } = req.body; 

        if (!url) {
            return res.status(400).json({ success: false, message: "Silinecek URL belirtilmedi." });
        }

        // 1. Cloudinary'den silme işlemi
        try {
            const urlParts = url.split('/');
            const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
            
            // Raw (Döküman) tiplerinde public_id'ye UZANTI DAHİL OLABİLİR veya OLMAYABİLİR.
            // Multer'da uzantıyı sildik, ancak Cloudinary bazen ekleyebilir. Raw dosyalarda dosyanın tam adını (uzantılı) denemek daha güvenlidir, 
            // ancak eğer middleware'de public_id uzantısız kaydedildiyse public_id uzantısız olmalıdır.
            // Raw dosyaları silerken resource_type: 'raw' ŞARTTIR.
            const publicId = folderAndFile.split('.')[0]; 
            
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        } catch (cloudinaryError) {
            console.error("Cloudinary'den silinirken hata oldu (Doc):", cloudinaryError);
        }

        // 2. Veritabanından silme işlemi
        const updatedBox = await removeMediaFromBoxService(boxId, 'doc', url);

        res.status(200).json({
            success: true,
            message: "Döküman başarıyla silindi.",
            data: updatedBox.media_docs
        });

    } catch (error) {
        console.error("Döküman silme hatası:", error);
        res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
};

