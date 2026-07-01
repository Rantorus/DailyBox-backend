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