import { createChapterService, deleteChapterService, getAllChaptersService, getChapterByIdService, getChaptersByUserIdService, updateChapterService } from "../models/chapterModel.js"; // DÜZELTME 1: .js eklendi

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

        // GÜVENLİK DÜZELTMESİ 2: userId'yi frontend'den (req.body) değil, KESİN olarak token'dan (req.user.id) almalıyız!
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

// TÜM CHAPTER'LARI GETİR (Sadece Admin için olmalı ama şimdilik kalsın)
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
        // GÜVENLİK DÜZELTMESİ 3: Adam URL'ye (params'a) başkasının ID'sini yazıp onun verilerini çekmesin diye
        // Parametreyi sildik, sadece giriş yapan adamın token'ındaki id'yi (req.user.id) kullandık!
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

        // GÜVENLİK DÜZELTMESİ 4: Bu chapter ona mı ait kontrolü yapıyoruz!
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

        // GÜVENLİK DÜZELTMESİ 5: Veriyi direkt güncellemek yerine ÖNCE veriyi bulup sahibini kontrol etmeliyiz!
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

        // GÜVENLİK DÜZELTMESİ 6: Yine silmeden önce sahibini kontrol etmeliyiz!
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