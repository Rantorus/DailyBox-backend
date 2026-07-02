import { createChapterService, deleteChapterService, getAllChaptersService, getChapterByIdService, getChaptersByUserIdService, updateChapterService } from "../models/chapterModel.js";
import { addBoxToChapterService, removeBoxFromChapterService, getBoxesByChapterIdService, checkBoxInChapterService, getBoxByIdService } from "../models/boxModel.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

// YENİ BİR CHAPTER EKLE
export const createChapter = async (req, res, next) => {
    try {
        const { title, description, coverImage } = req.body;

        const newChapter = await createChapterService({
            userId: req.user.id,
            title,
            description,
            coverImage
        });

        return handleResponse(res, 201, "Chapter created successfully", newChapter);
    } catch (error) {
        next(error);
    }
}

// TÜM CHAPTER'LARI GETİR
export const getAllChapters = async (req, res, next) => {
    try {
        const chapters = await getAllChaptersService();
        return handleResponse(res, 200, "Chapters fetched successfully", chapters);
    } catch (error) {
        next(error);
    }
}

// KULLANICININ KENDİ CHAPTER'LARINI GETİR
export const getChaptersByUserId = async (req, res, next) => {
    try {
        const chapters = await getChaptersByUserIdService(req.user.id);
        return handleResponse(res, 200, "Your chapters fetched successfully", chapters);
    } catch (error) {
        next(error);
    }
}

// TEK BİR CHAPTER GETİR
export const getChapterById = async (req, res, next) => {
    try {
        const chapter = await getChapterByIdService(req.params.id);

        if (!chapter) {
            return handleResponse(res, 404, "Chapter is not found");
        }

        if (chapter.user_id !== req.user.id) {
            return handleResponse(res, 403, "You do not have permission to view this chapter");
        }

        return handleResponse(res, 200, "Chapter fetched successfully", chapter);
    } catch (error) {
        next(error);
    }
}

// CHAPTER GÜNCELLE
export const updateChapter = async (req, res, next) => {
    try {
        const chapterId = req.params.id;

        const existingChapter = await getChapterByIdService(chapterId);

        if (!existingChapter) {
            return handleResponse(res, 404, "Chapter is not found");
        }

        if (existingChapter.user_id !== req.user.id) {
            return handleResponse(res, 403, "Başkasının chapter'ını güncelleyemezsin.");
        }

        const updatedChapter = await updateChapterService(chapterId, req.body);
        return handleResponse(res, 200, "Chapter updated successfully", updatedChapter);

    } catch (error) {
        next(error);
    }
}

// CHAPTER SİL
export const deleteChapter = async (req, res, next) => {
    try {
        const chapterId = req.params.id;

        const existingChapter = await getChapterByIdService(chapterId);

        if (!existingChapter) {
            return handleResponse(res, 404, "Chapter is not found");
        }

        if (existingChapter.user_id !== req.user.id) {
            return handleResponse(res, 403, "Başkasının chapter'ını silemezsin.");
        }

        const deletedChapter = await deleteChapterService(chapterId);
        return handleResponse(res, 200, "Chapter deleted successfully", deletedChapter);
    } catch (error) {
        next(error);
    }
}

// ========================================================
// MANY-TO-MANY (CHAPTER - BOX) İŞLEMLERİ
// ========================================================

// Chapter'a Kutu Ekle (POST /api/chapters/:id/boxes)
export const addBoxToChapter = async (req, res, next) => {
    try {
        const chapterId = req.params.id;
        const { boxId } = req.body;

        // 1. Chapter var mı ve kullanıcının mı?
        const chapter = await getChapterByIdService(chapterId);
        if (!chapter || chapter.user_id !== req.user.id) {
            return handleResponse(res, 403, "Permission denied for this chapter");
        }

        // 2. Kutu var mı ve kullanıcının mı? (GÜVENLİK)
        const box = await getBoxByIdService(boxId);
        if (!box) {
            return handleResponse(res, 404, "Box is not found");
        }
        if (box.user_id !== req.user.id) {
            return handleResponse(res, 403, "You cannot add someone else's box to your chapter");
        }

        // Kutu köprüye eklenir
        const linkedData = await addBoxToChapterService(chapterId, boxId);
        return handleResponse(res, 201, "Box added to chapter successfully", linkedData);
    } catch (error) {
        // Eğer zaten ekliyse unique constraint veya PK hatası fırlatabilir, errorHandler'a gider
        next(error);
    }
}

// Chapter'dan Kutu Çıkar (DELETE /api/chapters/:id/boxes/:boxId)
export const removeBoxFromChapter = async (req, res, next) => {
    try {
        const chapterId = req.params.id;
        const boxId = req.params.boxId;

        // 1. Chapter var mı ve kullanıcının mı?
        const chapter = await getChapterByIdService(chapterId);
        if (!chapter || chapter.user_id !== req.user.id) {
            return handleResponse(res, 403, "Permission denied for this chapter");
        }

        // Kutu köprüden çıkarılır
        await removeBoxFromChapterService(chapterId, boxId);
        return handleResponse(res, 200, "Box removed from chapter successfully");
    } catch (error) {
        next(error);
    }
}

// Bir kutunun chapter içinde olup olmadığını kontrol et ve eğer içindeyse kutuyu getir
export const checkBoxInChapter = async (req, res, next) => {
    try {
        const chapterId = req.params.id;
        const boxId = req.params.boxId;

        // 1. Chapter var mı ve kullanıcının mı?
        const chapter = await getChapterByIdService(chapterId);
        if (!chapter || chapter.user_id !== req.user.id) {
            return handleResponse(res, 403, "Permission denied for this chapter");
        }

        // Kutu köprüde var mı kontrolü
        const isExists = await checkBoxInChapterService(chapterId, boxId);
        
        if (!isExists) {
            return handleResponse(res, 404, "This box is not in the specified chapter");
        }

        // Kutu chapter içindeyse, kutunun tüm verilerini getir
        const box = await getBoxByIdService(boxId);
        return handleResponse(res, 200, "Box fetched from chapter successfully", box);
    } catch (error) {
        next(error);
    }
}