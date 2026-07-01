import express from "express";

import { createUser, deleteUser, getAllUsers, getUserById, updateUser, registerUser, loginUser, currentUser } from "../controllers/userControllers.js";
import { validateUser, validateLogin } from "../middlewares/inputValidator.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";

const router = express.Router();

// ===================================
// Auth (Kayıt/Giriş) Rotaları (Videodaki kısım)
// ===================================
router.post("/register", validateUser, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/current", validateToken, currentUser);

// ===================================
// Klasik CRUD Rotalarımız (Zaten sende olan kısım)
// ===================================
router.post("/", validateUser, createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", validateUser, updateUser);
router.delete("/:id", deleteUser);

export default router;
