import { getUserByIdService, getTotalUserStorageService } from "../models/userModel.js";

const MAX_PERSONAL_LIMIT_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_GLOBAL_LIMIT_BYTES = 2300 * 1024 * 1024; // 2.3 GB

export const checkQuota = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }

        const user = await getUserByIdService(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }

        // Admin limitsiz
        if (user.role === 'admin') {
            return next();
        }

        // Kişisel Limit Kontrolü (100 MB)
        const storageUsed = parseInt(user.storage_used || 0, 10);
        if (storageUsed >= MAX_PERSONAL_LIMIT_BYTES) {
            return res.status(403).json({ 
                status: 403, 
                message: "You have reached your personal storage limit (100 MB). You cannot add new media." 
            });
        }

        // Global Havuz Kontrolü (2.3 GB)
        const totalStorage = parseInt(await getTotalUserStorageService(), 10);
        if (totalStorage >= MAX_GLOBAL_LIMIT_BYTES) {
            return res.status(403).json({ 
                status: 403, 
                message: "Free server storage has reached its limit (2.3 GB). New media uploads are temporarily suspended." 
            });
        }

        next();
    } catch (error) {
        console.error("Quota Check Error:", error);
        return res.status(500).json({ status: 500, message: "Server error during quota check" });
    }
};
