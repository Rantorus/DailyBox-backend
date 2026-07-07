import { addMediaToBoxService, removeMediaFromBoxService } from '../models/boxModel.js';
import cloudinary from '../config/cloudinary.js';

// Fotoğraf Yükleme Controller'ı
export const uploadPhotoController = async (req, res) => {
    try {
        const { boxId } = req.params;

        // Multer çalıştıysa dosya bilgileri req.file içindedir
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Fotoğraf yüklenemedi." });
        }

        // Cloudinary'nin bize döndüğü güvenli URL
        const photoUrl = req.file.path;
        
        // Veritabanına ekle
        const updatedBox = await addMediaToBoxService(boxId, 'photo', photoUrl);

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
