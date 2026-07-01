import express from "express";
import { validateToken } from "../middlewares/validateTokenHandler.js";
import {
    getContacts,
    createContact,
    updateContact,
    deleteContact
} from "../controllers/contactControllers.js";

const router = express.Router();

// ===================================
// GÜVENLİK DUVARI (MIDDLEWARE)
// ===================================
// Bu satır sayesinde, altındaki hiçbir rotaya Token'ı olmayan giremez.
// İçeri giren kişinin bilgileri (req.user) artık bizim elimizdedir.
router.use(validateToken);

// ===================================
// CONTACT ROTALARI (Sadece giriş yapmış kullanıcılar için)
// ===================================
router.get("/", getContacts);        // Token'ı olan adam kendi contact'larını listeleyecek
router.post("/", createContact);     // Token'ı olan adam kendisine yeni contact ekleyecek
router.put("/:id", updateContact);   // Token'ı olan adam SADECE KENDİSİNE AİT olan contact'ı güncelleyecek
router.delete("/:id", deleteContact);// Token'ı olan adam SADECE KENDİSİNE AİT olan contact'ı silecek

export default router;