import { createBoxService, deleteBoxService, getAllBoxesService, getBoxByIdService, getBoxesByUserIdService, updateBoxService, getBoxesByChapterIdService } from "../models/boxModel.js";
import { getChapterByIdService } from "../models/chapterModel.js";

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
            hasLocation, locationAddress,
            locationLat, locationLng,
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
            hasLocation, locationAddress,
            locationLat, locationLng,
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

        const deletedBox = await deleteBoxService(boxId);
        return handleResponse(res, 200, "Box deleted successfully", deletedBox);
    } catch (error) {
        next(error);
    }
}