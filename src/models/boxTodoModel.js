import pool from "../config/db.js";

// Bir box'a ait tüm to-do'ları getirir
export const getTodosByBoxIdService = async (boxId) => {
    const result = await pool.query("SELECT * FROM box_todos WHERE box_id = $1 ORDER BY position_index ASC, id ASC", [boxId]);
    return result.rows;
};

// Yeni bir to-do oluşturur
export const createTodoService = async (todoData) => {
    const generatedId = `todo_${Math.floor(100000 + Math.random() * 900000)}`;

    const { boxId, text, isCompleted, positionIndex } = todoData;

    const query = `
        INSERT INTO box_todos (id, box_id, text, is_completed, position_index) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *;
    `;
    
    const values = [generatedId, boxId, text, isCompleted || false, positionIndex || 0];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// To-do'yu günceller (Metin veya pozisyon güncellemesi için)
export const updateTodoService = async (id, updateData) => {
    const { text, isCompleted, positionIndex } = updateData;
    
    const query = `
        UPDATE box_todos 
        SET text = $1, is_completed = $2, position_index = $3
        WHERE id = $4 
        RETURNING *;
    `;
    
    const values = [text, isCompleted, positionIndex, id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Sadece to-do durumunu değiştirir (Örneğin checkbox toggle)
export const toggleTodoStatusService = async (id, isCompleted) => {
    const query = `
        UPDATE box_todos 
        SET is_completed = $1
        WHERE id = $2 
        RETURNING *;
    `;
    
    const result = await pool.query(query, [isCompleted, id]);
    return result.rows[0];
};

// To-do siler
export const deleteTodoService = async (id) => {
    const result = await pool.query("DELETE FROM box_todos WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};
