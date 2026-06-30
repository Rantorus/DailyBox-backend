import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/userControllers.js";
import validateUser from "../middlewares/inputValidator.js";

const router = express.Router();

// Ana rotalarımız
router.post("/user/", validateUser, createUser);
router.get("/user/", getAllUsers);

// ID parametresi alan rotalarımız
router.get("/user/:id", getUserById);
router.put("/user/:id", validateUser, updateUser);
router.delete("/user/:id", deleteUser);

export default router;