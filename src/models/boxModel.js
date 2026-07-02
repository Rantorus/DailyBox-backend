import pool from "../config/db.js";

// Tüm kutuları (boxes) veritabanından çeker
export const getAllBoxesService = async () => {
    const result = await pool.query("SELECT * from boxes");
    return result.rows;
}

// Sadece belirli bir ID'ye sahip kutuyu çeker
export const getBoxByIdService = async (id) => {
    const result = await pool.query(`SELECT * from boxes WHERE id=$1`, [id])
    return result.rows[0];
}

// Belirli bir kullanıcıya (userId) ait tüm kutuları çeker
export const getBoxesByUserIdService = async (userId) => {
    const result = await pool.query(`SELECT * from boxes WHERE user_id=$1`, [userId])
    return result.rows;
}

// ========================================================
// MANY-TO-MANY (CHAPTER - BOX) İLİŞKİ SERVİSLERİ
// ========================================================

// Belirli bir Chapter (Bölüm) altındaki tüm kutuları çeker (JOIN kullanarak)
export const getBoxesByChapterIdService = async (chapterId) => {
    const query = `
        SELECT b.* 
        FROM boxes b
        JOIN chapter_boxes cb ON b.id = cb.box_id
        WHERE cb.chapter_id = $1
    `;
    const result = await pool.query(query, [chapterId]);
    return result.rows;
}

// Bir kutuyu bir chapter'a atar (Köprü tablosuna ekler)
export const addBoxToChapterService = async (chapterId, boxId) => {
    const query = `
        INSERT INTO chapter_boxes (chapter_id, box_id) 
        VALUES ($1, $2) 
        RETURNING *;
    `;
    const result = await pool.query(query, [chapterId, boxId]);
    return result.rows[0];
}

// Bir kutuyu bir chapter'dan çıkarır (Köprü tablosundan siler)
export const removeBoxFromChapterService = async (chapterId, boxId) => {
    const query = `
        DELETE FROM chapter_boxes 
        WHERE chapter_id = $1 AND box_id = $2 
        RETURNING *;
    `;
    const result = await pool.query(query, [chapterId, boxId]);
    return result.rows[0];
}

// Bir kutunun bir chapter içinde olup olmadığını kontrol eder
export const checkBoxInChapterService = async (chapterId, boxId) => {
    const query = `
        SELECT * FROM chapter_boxes 
        WHERE chapter_id = $1 AND box_id = $2;
    `;
    const result = await pool.query(query, [chapterId, boxId]);
    // Eğer kayıt varsa true döner, yoksa false döner
    return result.rows.length > 0;
}

// ========================================================
// TEMEL CRUD İŞLEMLERİ (DEVAMI)
// ========================================================

// Veritabanına yeni bir kutu ekler (POST)
export const createBoxService = async (boxData) => {
    // Kutu için tahmin edilemez benzersiz bir ID oluşturuyoruz
    const generatedId = `box_${Math.floor(100000 + Math.random() * 900000)}`;

    const {
        userId, title,
        category, date, description, tags,
        priority, type, isFavorite,
        hasLocation, locationAddress,
        locationLat, locationLng,
        hasReminder, reminderDate,
        reminderTitle, isReminded,
        hasNote, noteTitle, noteContent,
        noteIsVisible, hasMedia, mediaPhotos,
        mediaDocs, mediaAudio, status } = boxData;

    // Not: chapter_id artık boxes tablosunda yok
    const query = `
    INSERT INTO boxes
    (id, user_id, title,
     category, date, description, tags,
     priority, type, is_favorite,
      has_location, location_address,
       location_lat, location_lng,
        has_reminder, reminder_date,
        reminder_title, is_reminded, 
        has_note, note_title, note_content,
         note_is_visible, has_media, 
           media_photos, media_docs, media_audio, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
    $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
    $21,$22,$23,$24,$25,$26,$27)
    RETURNING *;
    `

    const values = [
        generatedId, userId, title,
        category, date, description, tags,
        priority, type, isFavorite,
        hasLocation, locationAddress,
        locationLat, locationLng,
        hasReminder, reminderDate,
        reminderTitle, isReminded,
        hasNote, noteTitle, noteContent,
        noteIsVisible, hasMedia, mediaPhotos,
        mediaDocs, mediaAudio, status];

    const result = await pool.query(query, values);
    return result.rows[0];
}

// Kutu günceller (Sadece gönderilen verileri güncelleyen Dinamik PATCH mimarisi)
export const updateBoxService = async (id, updateData) => {
    const allowedFields = {
        title: 'title', category: 'category', date: 'date',
        description: 'description', tags: 'tags', priority: 'priority', type: 'type', isFavorite: 'is_favorite',
        hasLocation: 'has_location', locationAddress: 'location_address', locationLat: 'location_lat', locationLng: 'location_lng',
        hasReminder: 'has_reminder', reminderDate: 'reminder_date', reminderTitle: 'reminder_title', isReminded: 'is_reminded',
        hasNote: 'has_note', noteTitle: 'note_title', noteContent: 'note_content', noteIsVisible: 'note_is_visible',
        hasMedia: 'has_media', mediaPhotos: 'media_photos', mediaDocs: 'media_docs', mediaAudio: 'media_audio',
        status: 'status'
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    // Gelen JSON'daki keyleri dolaşır, sadece veritabanında karşılığı olanları SQL'e ekler
    for (const key of Object.keys(updateData)) {
        if (allowedFields[key] !== undefined) {
            setClauses.push(`${allowedFields[key]} = $${paramIndex}`);
            values.push(updateData[key]);
            paramIndex++;
        }
    }

    if (setClauses.length === 0) return null; // Güncellenecek geçerli bir veri yoksa çıkış yap

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`); // Güncellenme tarihini otomatik tazele
    values.push(id);

    const query = `
        UPDATE boxes 
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
};

// Verilen ID'ye sahip kutuyu veritabanından kalıcı olarak siler
export const deleteBoxService = async (id) => {
    const result = await pool.query("DELETE FROM boxes WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};