import Joi from "joi";

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

const validateUser = (req, res, next) => {
    const { error } = userScheme.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            message: error.details[0].message,
        });
    }
    next();
};

export default validateUser;