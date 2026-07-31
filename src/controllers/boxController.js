import { 
    createBoxService, deleteBoxService, getAllBoxesService, 
    getBoxByIdService, getBoxesByUserIdService, updateBoxService, 
    getBoxesByChapterIdService, addMediaToBoxService, removeMediaFromBoxService 
} from "../models/boxModel.js";
import { updateUserStorageService } from "../models/userModel.js";
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
            hasReminder, reminderDate, reminderTime,
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
            hasReminder, reminderDate, reminderTime,
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

        // Eğer box'ın medyaları varsa Cloudinary'den temizle ve kotayı iade et
        let totalDeletedBytes = 0;
        if (existingBox.media_photos && Array.isArray(existingBox.media_photos)) {
            for (const item of existingBox.media_photos) {
                try {
                    const url = typeof item === 'object' ? item.url : item;
                    if (!url) continue;
                    const urlParts = url.split('/');
                    const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                    const publicId = folderAndFile.split('.')[0];
                    
                    // Boyutu öğren ve kotaya ekle
                    try {
                        const resource = await cloudinary.api.resource(publicId, { resource_type: "image" });
                        if (resource && resource.bytes) totalDeletedBytes += resource.bytes;
                    } catch (e) { console.error("Foto boyut çekilemedi:", e.message); }

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
                    const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));
                    if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
                        const pathParts = urlParts.slice(versionIndex + 1);
                        let publicId = pathParts.join('/');
                        publicId = publicId.replace(/\.[^/.]+$/, "");
                        
                        try {
                            const resource = await cloudinary.api.resource(publicId, { resource_type: "video" });
                            if (resource && resource.bytes) totalDeletedBytes += resource.bytes;
                        } catch (e) { console.error("Ses boyut çekilemedi:", e.message); }

                        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                    }
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
                    const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));
                    if (versionIndex !== -1 && versionIndex < urlParts.length - 1) {
                        const pathParts = urlParts.slice(versionIndex + 1);
                        const publicId = pathParts.join('/');
                        
                        try {
                            const resource = await cloudinary.api.resource(publicId, { resource_type: "raw" });
                            if (resource && resource.bytes) totalDeletedBytes += resource.bytes;
                        } catch (e) { console.error("Doc boyut çekilemedi:", e.message); }

                        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
                    }
                } catch (cloudinaryError) {
                    console.error("Cloudinary silme hatası (Box Delete Doc):", cloudinaryError);
                }
            }
        }

        const deletedBox = await deleteBoxService(boxId);

        // Kullanıcıya kaybettiği kotayı tek seferde iade et
        if (totalDeletedBytes > 0) {
            await updateUserStorageService(req.user.id, -totalDeletedBytes);
        }

        return handleResponse(res, 200, "Box deleted successfully", deletedBox);
    } catch (error) {
        next(error);
    }
}