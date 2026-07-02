import express from "express";
import { 
    addTodo, 
    deleteTodo, 
    getBoxTodos, 
    updateTodo,
    reorderTodos
} from "../controllers/todoController.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { validateTodo, validateTodoUpdate } from "../middlewares/inputValidator.js";

const router = express.Router();

// Bütün Todo işlemleri için kullanıcı girişi (token) şartı
router.use(validateToken);

// ===================================
// TEMEL CRUD İŞLEMLERİ
// ===================================

// Bir kutuya ait todoları getir
router.get("/box/:boxId", getBoxTodos);

// Bir kutuya yeni todo ekle (Sadece zorunlu alanları doğrula)
router.post("/box/:boxId", validateTodo, addTodo);

// Bir todoyu güncelle (Sadece gönderilen alanları doğrula)
router.patch("/:id", validateTodoUpdate, updateTodo);

// Bir todoyu sil
router.delete("/:id", deleteTodo);

// ===================================
// EKSTRA İŞLEMLER
// ===================================

// Todoların sırasını güncelle (Sürükle-Bırak için)
router.patch("/box/reorder", reorderTodos);

export default router;
