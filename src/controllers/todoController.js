import { addTodoService, deleteTodoService, getTodosByBoxIdService, updateTodoService, getTodoByIdService, updateTodoPositionsService } from "../models/todoModel.js";
import { getBoxByIdService } from "../models/boxModel.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

export const getBoxTodos = async (req, res, next) => {
    try {
        const boxId = req.params.boxId;

        // GÜVENLİK: Bu kutu var mı? Ve bu kutu isteği atan kullanıcıya mı ait?
        const box = await getBoxByIdService(boxId);
        if (!box) {
            return handleResponse(res, 404, "Box is not found");
        }
        if (box.user_id !== req.user.id) {
            return handleResponse(res, 403, "You do not have permission to view this box's todos");
        }

        // Güvenliği geçtik! Artık o kutuya ait todoları getirebiliriz
        const todos = await getTodosByBoxIdService(boxId);

        return handleResponse(res, 200, "Todos fetched successfully", todos);
    } catch (error) {
        next(error);
    }
}

export const addTodo = async (req, res, next) => {
    try {
        const boxId = req.params.boxId;

        // GÜVENLİK
        const box = await getBoxByIdService(boxId);
        if (!box) {
            return handleResponse(res, 404, "Box is not found");
        }
        if (box.user_id !== req.user.id) {
            return handleResponse(res, 403, "You do not have permission to add a todo to this box");
        }

        const { text, isCompleted, positionIndex } = req.body;

        // Servise parametreleri doğru şekilde yolluyoruz
        const newTodo = await addTodoService(boxId, {
            text,
            isCompleted,
            positionIndex
        });

        // Hata düzeltildi: newChapter yerine newTodo dönüyor
        return handleResponse(res, 201, "Todo created successfully", newTodo);
    } catch (error) {
        next(error);
    }
}

export const updateTodo = async (req, res, next) => {
    try {
        const todoId = req.params.id; // URL'den gelen id todo'nun kendi id'si

        // 1. Önce güncellenmek istenen Todo var mı diye bakıyoruz
        const existingTodo = await getTodoByIdService(todoId);
        if (!existingTodo) {
            return handleResponse(res, 404, "Todo is not found");
        }

        // 2. GÜVENLİK: Todo'nun bağlı olduğu Kutu bu kullanıcıya mı ait?
        const box = await getBoxByIdService(existingTodo.box_id);
        if (!box || box.user_id !== req.user.id) {
            return handleResponse(res, 403, "You cannot update someone else's todo.");
        }

        // 3. Güncelle
        const updatedTodo = await updateTodoService(todoId, req.body);
        return handleResponse(res, 200, "Todo updated successfully", updatedTodo);

    } catch (error) {
        next(error);
    }
}

export const deleteTodo = async (req, res, next) => {
    try {
        const todoId = req.params.id;

        // 1. Önce silinmek istenen Todo var mı diye bakıyoruz
        const existingTodo = await getTodoByIdService(todoId);
        if (!existingTodo) {
            return handleResponse(res, 404, "Todo is not found");
        }

        // 2. GÜVENLİK: Todo'nun bağlı olduğu Kutu bu kullanıcıya mı ait?
        const box = await getBoxByIdService(existingTodo.box_id);
        if (!box || box.user_id !== req.user.id) {
            return handleResponse(res, 403, "You cannot delete someone else's todo.");
        }

        // 3. Sil
        const deletedTodo = await deleteTodoService(todoId);
        return handleResponse(res, 200, "Todo deleted successfully", deletedTodo);
    } catch (error) {
        next(error);
    }
}

export const reorderTodos = async (req, res, next) => {
    try {
        const { todosArray } = req.body; 
        // Örn: todosArray = [{id: "todo_1", positionIndex: 0}, {id: "todo_2", positionIndex: 1}]

        if (!todosArray || todosArray.length === 0) {
            return handleResponse(res, 400, "Todos array is required");
        }

        // Güvenlik: Kullanıcının sadece kendi görevlerini sıraladığından emin olmak için
        // İlk görevin kutusunu kontrol etmemiz yeterli (zaten hepsi aynı kutuda olmalı)
        const sampleTodo = await getTodoByIdService(todosArray[0].id);
        if(!sampleTodo) {
            return handleResponse(res, 404, "Todo not found");
        }

        const box = await getBoxByIdService(sampleTodo.box_id);
        if (!box || box.user_id !== req.user.id) {
            return handleResponse(res, 403, "You cannot reorder someone else's todos.");
        }

        // Servisi çağırıp işlemi başlat
        await updateTodoPositionsService(todosArray);
        
        return handleResponse(res, 200, "Todos reordered successfully");
    } catch (error) {
        next(error);
    }
}