import Joi from "joi";

// Kayıt (Register) ve normal User oluşturma için schema
const userScheme = Joi.object({
    fullName: Joi.string().min(3).max(150).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    avatar: Joi.string().uri().optional(),
    location: Joi.string().optional(),
    role: Joi.string().valid("user", "admin").optional(),
    stats: Joi.object().optional(),
    isActive: Joi.boolean().optional()
});

// Sadece Giriş (Login) işlemi için schema
const loginScheme = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const validateUser = (req, res, next) => {
    const { error } = userScheme.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message,
        });
    }
    next();
};

export const validateLogin = (req, res, next) => {
    const { error } = loginScheme.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message,
        });
    }
    next();
};

// ==========================================
// CHAPTER VALIDASYONU
// ==========================================
const chapterScheme = Joi.object({
    title: Joi.string().min(2).max(100).required(), // Başlık zorunlu ve en az 2 karakter olmalı
    description: Joi.string().max(500).optional(),
    coverImage: Joi.string().uri().optional()
});

export const validateChapter = (req, res, next) => {
    const { error } = chapterScheme.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message, // "title is required" gibi net mesajlar dönecek
        });
    }
    next();
};

// ==========================================
// BOX VALIDASYONU (MANY-TO-MANY MİMARİSİ)
// ==========================================
const boxScheme = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    date: Joi.date().iso().required(), // Frontend'den "2023-11-25T10:00:00Z" gibi gelecek
    
    // Aşağıdakiler opsiyonel
    category: Joi.string().optional(),
    description: Joi.string().optional().allow(null, ''),
    tags: Joi.array().items(Joi.string()).optional(),
    priority: Joi.string().optional(),
    type: Joi.string().optional(),
    isFavorite: Joi.boolean().optional(),
    
    // Lokasyon
    hasLocation: Joi.boolean().optional(),
    locationAddress: Joi.string().optional().allow(null, ''),
    locationLat: Joi.number().optional(),
    locationLng: Joi.number().optional(),
    
    // Not
    hasNote: Joi.boolean().optional(),
    noteTitle: Joi.string().optional().allow(null, ''),
    noteContent: Joi.string().optional().allow(null, ''),
    noteIsVisible: Joi.boolean().optional(),
    
    // Hatırlatıcı
    hasReminder: Joi.boolean().optional(),
    reminderDate: Joi.date().iso().optional().allow(null, ''),
    reminderTitle: Joi.string().optional().allow(null, ''),
    isReminded: Joi.boolean().optional(),
    
    // Diğerleri
    status: Joi.string().optional()
});

// Sadece yeni kayıt oluştururken zorunlu alanları denetler
export const validateBox = (req, res, next) => {
    const { error } = boxScheme.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message,
        });
    }
    next();
};

// Güncelleme (PATCH) yaparken sadece gelen verileri denetler
export const validateBoxUpdate = (req, res, next) => {
    const optionalBoxScheme = boxScheme.fork(Object.keys(boxScheme.describe().keys), (schema) => schema.optional());
    const { error } = optionalBoxScheme.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message,
        });
    }
    next();
};