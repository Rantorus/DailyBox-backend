import express from "express";

import { createUser, deleteUser, getAllUsers, getUserById, updateUser, registerUser, loginUser, currentUser, uploadAvatarController, changePasswordController } from "../controllers/userControllers.js";
import { validateUser, validateLogin } from "../middlewares/inputValidator.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { uploadAvatarMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ===================================
// Auth (Kayıt/Giriş) Rotaları (Videodaki kısım)
// ===================================
router.post("/register", validateUser, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/current", validateToken, currentUser);
router.patch("/change-password", validateToken, changePasswordController);

// ===================================
// Avatar Yükleme Rotası
// ===================================
router.post("/:id/avatar", validateToken, uploadAvatarMiddleware.single('avatar'), uploadAvatarController);

// ===================================
// Klasik CRUD Rotalarımız (Zaten sende olan kısım)
// ===================================
router.post("/", validateUser, createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", validateUser, updateUser);
router.delete("/:id", deleteUser);

export default router;
