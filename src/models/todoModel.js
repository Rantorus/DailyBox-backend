import pool from "../config/db.js"; 

// Bir kutunun içindeki tüm görevleri getir (Sıralamasına göre)
export const getTodosByBoxIdService = async (boxId) =>{
    // Görevleri position_index değerine göre küçükten büyüğe sıralı getiriyoruz (Drag & Drop uyumluluğu için)
    const result = await pool.query("SELECT * FROM box_todos WHERE box_id=$1 ORDER BY position_index ASC", [boxId]);
    return result.rows;
} 

// Tek bir görevi ID ile getir (Güvenlik kontrolleri için gerekli)
export const getTodoByIdService = async (todoId) =>{
    const result = await pool.query("SELECT * FROM box_todos WHERE id=$1", [todoId]);
    return result.rows[0];
} 

// Kutunun içine yeni bir görev ekle
export const addTodoService = async (boxId, todoData) =>{
    const generatedId = `todo_${Math.floor(100000 + Math.random() * 900000)}`; 

    // Hata Düzeltildi: boxId parametre olarak geliyor, todoData'dan çıkarmamıza gerek yok.
    const { text, isCompleted, positionIndex } = todoData;

    // Hata Düzeltildi: isCompleted ve positionIndex frontend'den gelmezse diye varsayılan değer (fallback) atıyoruz
    const finalIsCompleted = isCompleted !== undefined ? isCompleted : false;
    const finalPositionIndex = positionIndex !== undefined ? positionIndex : 0;

    // Hata Düzeltildi: INSERT INTO chapters yerine INSERT INTO box_todos yazılmalıydı.
    const query = `
        INSERT INTO box_todos (id, box_id, text, is_completed, position_index)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [generatedId, boxId, text, finalIsCompleted, finalPositionIndex];

    const result = await pool.query(query, values);
    return result.rows[0];
}

// Belirli bir görevi güncelle
export const updateTodoService = async (todoId, updateData) =>{
    // Hata Düzeltildi: Parametre updateData olduğu için updateData'dan destructure etmeliyiz
    const { text, isCompleted, positionIndex } = updateData;

    // Hata Düzeltildi: UPDATE chapters yerine UPDATE box_todos yazılmalıydı.
    // Geliştirme: COALESCE kullanarak sadece gönderilen (undefined olmayan) verileri güncelliyoruz.
    const query = `
        UPDATE box_todos
        SET 
            text = COALESCE($1, text), 
            is_completed = COALESCE($2, is_completed), 
            position_index = COALESCE($3, position_index)
        WHERE id = $4
        RETURNING *;
    `;

    const values = [text, isCompleted, positionIndex, todoId];

    const result = await pool.query(query, values);
    return result.rows[0];
}

// Belirli bir görevi sil
export const deleteTodoService = async (id) =>{
    const result = await pool.query("DELETE FROM box_todos WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
}

// Drag & Drop Sıralaması (Toplu Güncelleme)
// Frontend bize [{id: 'todo_1', positionIndex: 0}, {id: 'todo_2', positionIndex: 1}] şeklinde bir dizi yollayacak
export const updateTodoPositionsService = async (todosArray) => {
    // Veritabanında yarım yamalak işlem olmasını önlemek için "Transaction" (İşlem Bloğu) başlatıyoruz
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // İşlemi başlat

        // Bütün diziyi dönüp her biri için UPDATE sorgusu atıyoruz
        for (const todo of todosArray) {
            await client.query(
                `UPDATE box_todos SET position_index = $1 WHERE id = $2`,
                [todo.positionIndex, todo.id]
            );
        }

        await client.query('COMMIT'); // İşlem başarılıysa onayla ve kaydet
        return true;
    } catch (error) {
        await client.query('ROLLBACK'); // Hata çıkarsa bütün güncellemeleri iptal et (Geri al)
        throw error;
    } finally {
        client.release(); // Bağlantıyı havuza geri bırak
    }
}