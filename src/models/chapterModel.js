import pool from "../config/db.js"; 

// Tüm chapter'ları veritabanından çeker
export const getAllChaptersService = async () => {
    const result = await pool.query("SELECT * from chapters");
    return result.rows;
}

// Belirli bir ID'ye sahip chapter'ı getirir
export const getChapterByIdService = async (id) => {
    const result = await pool.query(`SELECT * from chapters WHERE id=$1`, [id])
    return result.rows[0];
}

// Sadece o anki kullanıcıya (userId) ait olan chapter'ları getirir
export const getChaptersByUserIdService = async (userId) => {
    const result = await pool.query(`SELECT * from chapters WHERE user_id=$1`, [userId])
    return result.rows;
}

// Yeni bir chapter oluşturur ve veritabanına kaydeder
export const createChapterService = async (chapterData) => {
    // 1. Sektör standardı tahmin edilemez özel bir ID üretiyoruz (Örn: chp_627491)
    const generatedId = `chp_${Math.floor(100000 + Math.random() * 900000)}`; 

    const { userId, title, description, coverImage } = chapterData;

    const query = `
    INSERT INTO chapters
    (id,user_id,title,description,cover_image)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *;
    `

    const values = [generatedId, userId, title, description, coverImage];

    const result = await pool.query(query, values);
    return result.rows[0];

}

// Var olan bir chapter'ı günceller
export const updateChapterService = async (id, updateData) => { 
    const { title, description, coverImage } = updateData;

    const query = `
    UPDATE chapters
    SET title=$1, description=$2, cover_image=$3, updated_at = CURRENT_TIMESTAMP
    WHERE id=$4
    RETURNING *;
    `

    const values = [title, description, coverImage, id];

    const result = await pool.query(query, values);
    return result.rows[0];
}

// Verilen ID'ye sahip chapter'ı tamamen siler
export const deleteChapterService = async (id) => {
    const result = await pool.query("DELETE FROM chapters WHERE id = $1 RETURNING *",[id]);
    return result.rows[0];
}
