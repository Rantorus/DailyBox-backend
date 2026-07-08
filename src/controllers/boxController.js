import { 
    createBoxService, deleteBoxService, getAllBoxesService, 
    getBoxByIdService, getBoxesByUserIdService, updateBoxService, 
    getBoxesByChapterIdService, addMediaToBoxService, removeMediaFromBoxService 
} from "../models/boxModel.js";
import { getChapterByIdService } from "../models/chapterModel.js";
import cloudinary from "../config/cloudinaryConfig.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};


export const createBox = async (req, res, next) => {
    try {
        const { title,
            category, date, description, tags,
            priority, type, isFavorite,
            hasLocation, locations,
            hasReminder, reminderDate,
            reminderTitle, isReminded,
            hasNote, noteTitle, noteContent,
            noteIsVisible, hasMedia, mediaPhotos,
            mediaDocs, mediaAudio, status } = req.body;

        const newBox = await createBoxService({
            userId: req.user.id,
            title,
            category, date, description, tags,
            priority, type, isFavorite,
            hasLocation, locations,
            hasReminder, reminderDate,
            reminderTitle, isReminded,
            hasNote, noteTitle, noteContent,
            noteIsVisible, hasMedia, mediaPhotos,
            mediaDocs, mediaAudio, status
        });

        return handleResponse(res, 201, "Box created successfully", newBox);
    } catch (error) {
        next(error);
    }
}

export const getAllBoxes = async (req, res, next) => {
    try {
        const boxes = await getAllBoxesService();
        return handleResponse(res, 200, "Boxes fetched successfully", boxes);
    } catch (error) {
        next(error);
    }
}

export const getBoxById = async (req, res, next) => {
    try {
        const box = await getBoxByIdService(req.params.id);

        if (!box) {
            return handleResponse(res, 404, "Box is not found");
        }

        if (box.user_id !== req.user.id) {
            return handleResponse(res, 403, "You do not have permission to view this box");
        }

        return handleResponse(res, 200, "Box fetched successfully", box);
    } catch (error) {
        next(error);
    }
}

export const getBoxesByUserId = async (req, res, next) => {
    try {
        const boxes = await getBoxesByUserIdService(req.user.id);
        return handleResponse(res, 200, "Your boxes fetched successfully", boxes);
    } catch (error) {
        next(error);
    }
}

// Chapter'a ait box'ları getirme işlemi
export const getBoxesByChapterId = async (req, res, next) => {
    try {
        const chapterId = req.params.chapterId;

        // GÜVENLİK: Chapter bu kullanıcıya mı ait kontrol et
        const chapter = await getChapterByIdService(chapterId);
        if (!chapter) {
            return handleResponse(res, 404, "Chapter is not found");
        }

        if (chapter.user_id !== req.user.id) {
            return handleResponse(res, 403, "You do not have permission to view boxes of this chapter");
        }

        const boxes = await getBoxesByChapterIdService(chapterId);
        return handleResponse(res, 200, "Chapter boxes fetched successfully", boxes);
    } catch (error) {
        next(error);
    }
}

export const updateBox = async (req, res, next) => {
    try {
        const boxId = req.params.id;

        const existingBox = await getBoxByIdService(boxId);

        if (!existingBox) {
            return handleResponse(res, 404, "Box is not found");
        }

        if (existingBox.user_id !== req.user.id) {
            return handleResponse(res, 403, "Başkasının box'ını güncelleyemezsin.");
        }

        const updatedBox = await updateBoxService(boxId, req.body);
        return handleResponse(res, 200, "Box updated successfully", updatedBox);

    } catch (error) {
        next(error);
    }
}

export const deleteBox = async (req, res, next) => {
    try {
        const boxId = req.params.id;

        const existingBox = await getBoxByIdService(boxId);

        if (!existingBox) {
            return handleResponse(res, 404, "Box is not found");
        }

        if (existingBox.user_id !== req.user.id) {
            return handleResponse(res, 403, "Başkasının box'ını silemezsin.");
        }

        // Eğer box'ın medyaları varsa Cloudinary'den temizle
        if (existingBox.media_photos && Array.isArray(existingBox.media_photos)) {
            for (const item of existingBox.media_photos) {
                try {
                    const url = typeof item === 'object' ? item.url : item;
                    if (!url) continue;
                    const urlParts = url.split('/');
                    const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                    const publicId = folderAndFile.split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error("Cloudinary silme hatası (Box Delete Photo):", cloudinaryError);
                }
            }
        }

        if (existingBox.media_audio && Array.isArray(existingBox.media_audio)) {
            for (const item of existingBox.media_audio) {
                try {
                    const url = typeof item === 'object' ? item.url : item;
                    if (!url) continue;
                    const urlParts = url.split('/');
                    const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                    const publicId = folderAndFile.split('.')[0];
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                } catch (cloudinaryError) {
                    console.error("Cloudinary silme hatası (Box Delete Audio):", cloudinaryError);
                }
            }
        }

        if (existingBox.media_docs && Array.isArray(existingBox.media_docs)) {
            for (const item of existingBox.media_docs) {
                try {
                    const url = typeof item === 'object' ? item.url : item;
                    if (!url) continue;
                    const urlParts = url.split('/');
                    const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                    // Dökümanlar raw olarak yüklendiğinde publicId genelde uzantı dahil olabilir veya olmayabilir.
                    const publicId = folderAndFile.split('.')[0];
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                } catch (cloudinaryError) {
                    console.error("Cloudinary silme hatası (Box Delete Doc):", cloudinaryError);
                }
            }
        }

        const deletedBox = await deleteBoxService(boxId);
        return handleResponse(res, 200, "Box deleted successfully", deletedBox);
    } catch (error) {
        next(error);
    }
}

// ==========================================
// MEDIA CONTROLLERS
// ==========================================

export const uploadBoxMedia = async (req, res, next) => {
    try {
        const boxId = req.params.id;

        // 1. Güvenlik Kontrolü
        const box = await getBoxByIdService(boxId);
        if (!box) {
            return handleResponse(res, 404, "Kutu bulunamadı");
        }
        if (box.user_id !== req.user.id) {
            return handleResponse(res, 403, "Bu kutuya medya yükleme yetkiniz yok");
        }

        // 2. Multer'ın dosyayı başarıyla yakalayıp yakalamadığını kontrol et (upload.any() kullandığımız için req.files dizisine düşer)
        if (!req.files || req.files.length === 0) {
            return handleResponse(res, 400, "Lütfen bir dosya seçin");
        }

        const file = req.files[0]; // İlk yakalanan dosyayı alıyoruz

        // 3. Dosyanın Cloudinary URL'sini ve tipini al (fieldname: photo, audio, doc)
        const fileUrl = file.path; // Cloudinary'nin bize döndüğü güvenli URL
        const mediaType = file.fieldname; 

        // 3.5. Sıkı Doğrulama: Fieldname photo, audio veya doc olmak ZORUNDA
        const validMediaTypes = ["photo", "audio", "doc"];
        if (!validMediaTypes.includes(mediaType)) {
            // Eğer geçersiz bir key ile geldiyse, Cloudinary'e yüklenen bu gereksiz dosyayı hemen siliyoruz (Çöp birikmesin)
            const publicId = file.filename; // multer-storage-cloudinary filename özelliğine public_id'yi koyar
            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
            return handleResponse(res, 400, "Geçersiz dosya anahtarı (key). Sadece 'photo', 'audio' veya 'doc' kullanabilirsiniz.");
        }

        // 4. Veritabanını güncelle (ARRAY_APPEND)
        const updatedBox = await addMediaToBoxService(boxId, mediaType, fileUrl);

        return handleResponse(res, 201, "Medya başarıyla yüklendi", updatedBox);
    } catch (error) {
        next(error);
    }
}

export const deleteBoxMedia = async (req, res, next) => {
    try {
        const boxId = req.params.id;
        const { mediaUrl, mediaType } = req.body; 
        // Örn: { mediaUrl: "https://res.cloudinary.com/.../dosya.jpg", mediaType: "photo" }

        if (!mediaUrl || !mediaType) {
            return handleResponse(res, 400, "mediaUrl ve mediaType gereklidir");
        }

        // 1. Güvenlik Kontrolü
        const box = await getBoxByIdService(boxId);
        if (!box) {
            return handleResponse(res, 404, "Kutu bulunamadı");
        }
        if (box.user_id !== req.user.id) {
            return handleResponse(res, 403, "Bu kutudan medya silme yetkiniz yok");
        }

        // 2. Cloudinary'den dosyayı silmek için URL içinden "Public ID" (Dosyanın adı) bulmamız lazım.
        // URL Formatı genelde şöyledir: .../v1234567/dailybox_photos/dosya_adi.jpg
        // Dosya adı ve klasör yolunu ayırt etmeliyiz.
        // Split işlemiyle Public ID'yi çıkartıyoruz:
        const urlParts = mediaUrl.split('/');
        const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));
        
        let publicId = "";
        if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
            // Versiyondan sonraki kısımları alıp birleştiriyoruz
            const pathParts = urlParts.slice(versionIndex + 1);
            publicId = pathParts.join('/');
            
            // Eğer resim veya ses ise uzantıyı siliyoruz (Cloudinary image/video için uzantısız publicId bekler)
            if (mediaType !== "doc") {
                publicId = publicId.replace(/\.[^/.]+$/, "");
            }
            // 'doc' (raw) türler için publicId uzantıyı da İÇERMELİDİR!
        } else {
             return handleResponse(res, 400, "Geçersiz Cloudinary URL formatı");
        }

        // 3. Cloudinary sunucularından dosyayı kalıcı olarak sil
        let resourceType = "image";
        if (mediaType === "audio") resourceType = "video";
        if (mediaType === "doc") resourceType = "raw";
        
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });

        // 4. Veritabanından (ARRAY_REMOVE) URL'i sil
        const updatedBox = await removeMediaFromBoxService(boxId, mediaType, mediaUrl);

        return handleResponse(res, 200, "Medya başarıyla silindi", updatedBox);
    } catch (error) {
        next(error);
    }
}