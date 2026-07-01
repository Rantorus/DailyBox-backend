import pool from "../config/db.js";

// Tüm box'ları getirir
export const getAllBoxesService = async () => {
    const result = await pool.query("SELECT * FROM boxes");
    return result.rows;
};

// ID bazlı tek bir box getirir
export const getBoxByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM boxes WHERE id = $1", [id]);
    return result.rows[0];
};

// Bir user'a ait tüm box'ları getirir
export const getBoxesByUserIdService = async (userId) => {
    const result = await pool.query("SELECT * FROM boxes WHERE user_id = $1", [userId]);
    return result.rows;
};

// Bir chapter'a ait tüm box'ları getirir
export const getBoxesByChapterIdService = async (chapterId) => {
    const result = await pool.query("SELECT * FROM boxes WHERE chapter_id = $1", [chapterId]);
    return result.rows;
};

// Yeni bir box oluşturur
export const createBoxService = async (boxData) => {
    const { category } = boxData;
    // Prefix log veya plan kategorisine göre değişebilir
    const prefix = category === 'plan' ? 'plan_' : 'log_';
    const generatedId = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;

    const {
        userId, chapterId, title, date, description, tags, priority, type, isFavorite,
        hasLocation, locationAddress, locationLat, locationLng,
        hasReminder, reminderDate, reminderTitle, isReminded,
        hasNote, noteTitle, noteContent, noteIsVisible,
        hasMedia, mediaPhotos, mediaDocs, mediaAudio,
        status
    } = boxData;

    const query = `
        INSERT INTO boxes (
            id, user_id, chapter_id, title, category, date, description, tags, priority, type, is_favorite,
            has_location, location_address, location_lat, location_lng,
            has_reminder, reminder_date, reminder_title, is_reminded,
            has_note, note_title, note_content, note_is_visible,
            has_media, media_photos, media_docs, media_audio, status
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            $12, $13, $14, $15,
            $16, $17, $18, $19,
            $20, $21, $22, $23,
            $24, $25, $26, $27, $28
        ) RETURNING *;
    `;
    
    const values = [
        generatedId, userId, chapterId, title, category, date, description, tags, priority, type, isFavorite,
        hasLocation, locationAddress, locationLat, locationLng,
        hasReminder, reminderDate, reminderTitle, isReminded,
        hasNote, noteTitle, noteContent, noteIsVisible,
        hasMedia, mediaPhotos, mediaDocs, mediaAudio, status
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Box günceller
export const updateBoxService = async (id, updateData) => {
    const {
        chapterId, title, category, date, description, tags, priority, type, isFavorite,
        hasLocation, locationAddress, locationLat, locationLng,
        hasReminder, reminderDate, reminderTitle, isReminded,
        hasNote, noteTitle, noteContent, noteIsVisible,
        hasMedia, mediaPhotos, mediaDocs, mediaAudio,
        status
    } = updateData;
    
    const query = `
        UPDATE boxes SET 
            chapter_id = $1, title = $2, category = $3, date = $4, description = $5, tags = $6, priority = $7, type = $8, is_favorite = $9,
            has_location = $10, location_address = $11, location_lat = $12, location_lng = $13,
            has_reminder = $14, reminder_date = $15, reminder_title = $16, is_reminded = $17,
            has_note = $18, note_title = $19, note_content = $20, note_is_visible = $21,
            has_media = $22, media_photos = $23, media_docs = $24, media_audio = $25,
            status = $26, updated_at = CURRENT_TIMESTAMP
        WHERE id = $27 
        RETURNING *;
    `;
    
    const values = [
        chapterId, title, category, date, description, tags, priority, type, isFavorite,
        hasLocation, locationAddress, locationLat, locationLng,
        hasReminder, reminderDate, reminderTitle, isReminded,
        hasNote, noteTitle, noteContent, noteIsVisible,
        hasMedia, mediaPhotos, mediaDocs, mediaAudio,
        status, id
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Box siler
export const deleteBoxService = async (id) => {
    const result = await pool.query("DELETE FROM boxes WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};
