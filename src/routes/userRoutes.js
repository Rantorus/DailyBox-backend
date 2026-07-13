import express from "express";
import rateLimit from "express-rate-limit";

import { createUser, deleteUser, getAllUsers, getUserById, updateUser, registerUser, loginUser, currentUser, uploadAvatarController, changePasswordController, forgotPassword, resetPassword, verifyOtp } from "../controllers/userControllers.js";
import { validateUser, validateLogin } from "../middlewares/inputValidator.js";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import { uploadAvatarMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Auth (Kayıt/Giriş) Rotaları 
router.post("/register", validateUser, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/current", validateToken, currentUser);
router.patch("/change-password", validateToken, changePasswordController);

// Şifremi Unuttum Rate Limiter (Aynı IP'den 1 saatte max 3 istek)
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 3, // Limit each IP to 3 requests per windowMs
    message: { status: 429, message: "Too many password reset requests. Please try again after 1 hour." }
});

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Avatar Yükleme Rotası
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
