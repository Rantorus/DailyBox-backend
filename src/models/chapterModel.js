import pool from "../config/db.js";

// Tüm chapter'ları getirir
export const getAllChaptersService = async () => {
    const result = await pool.query("SELECT * FROM chapters");
    return result.rows;
};

// ID bazlı tek bir chapter getirir
export const getChapterByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM chapters WHERE id = $1", [id]);
    return result.rows[0];
};

// Bir user'a ait tüm chapter'ları getirir
export const getChaptersByUserIdService = async (userId) => {
    const result = await pool.query("SELECT * FROM chapters WHERE user_id = $1", [userId]);
    return result.rows;
};

// Yeni bir chapter oluşturur
export const createChapterService = async (chapterData) => {
    const generatedId = `chp_${Math.floor(100000 + Math.random() * 900000)}`;

    const { userId, title, description, coverImage } = chapterData;

    const query = `
        INSERT INTO chapters 
        (id, user_id, title, description, cover_image) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *;
    `;
    
    const values = [generatedId, userId, title, description, coverImage];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Chapter günceller
export const updateChapterService = async (id, updateData) => {
    const { title, description, coverImage } = updateData;
    
    const query = `
        UPDATE chapters 
        SET title = $1, description = $2, cover_image = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 
        RETURNING *;
    `;
    
    const values = [title, description, coverImage, id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Chapter siler
export const deleteChapterService = async (id) => {
    const result = await pool.query("DELETE FROM chapters WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};
