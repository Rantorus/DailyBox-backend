import pool from "../config/db.js";

// Tüm kullanıcıları getirir
export const getAllUsersService = async () => {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
};

// ID bazlı tek bir kullanıcı getirir
export const getUserByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
};

// E-posta bazlı tek bir kullanıcı getirir (Login ve Register kontrolleri için)
export const getUserByEmailService = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

// Yeni bir kullanıcı oluşturur (Sistem otomatik özel ID üretir)
export const createUserService = async (userData) => {
    // 1. Sektör standardı tahmin edilemez özel bir ID üretiyoruz (Örn: usr_627491)
    const generatedId = `usr_${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. Gelen body paketini parçalıyoruz
    const { fullName, email, password, avatar, location, role, stats, isActive } = userData;

    // EĞER boş gönderilen (undefined) değerler varsa, PostgreSQL'deki 'DEFAULT' değerlerinin
    // ezilip NULL olarak kaydedilmemesi için JavaScript tarafında yedek (fallback) değerler atıyoruz:
    const finalRole = role || 'user';
    const finalStats = stats || '{"completedBoxes": 0, "activeChapters": 0, "streakDays": 0}';
    const finalIsActive = isActive !== undefined ? isActive : true;

    // 3. PostgreSQL sorgumuz
    const query = `
        INSERT INTO users 
        (id, full_name, email, password, avatar, location, role, stats, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *;
    `;
    
    // 4. Tam 9 adet parametreyi sırasıyla diziye diziyoruz
    const values = [generatedId, fullName, email, password, avatar, location, finalRole, finalStats, finalIsActive];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Kullanıcı bilgilerini günceller
export const updateUserService = async (id, updateData) => {
    // Önce mevcut kullanıcıyı çek
    const existingUser = await getUserByIdService(id);
    if (!existingUser) return null;

    // Yeni gelen verileri mevcut verilerle harmanla
    const fullName = updateData.fullName !== undefined ? updateData.fullName : existingUser.full_name;
    const email = updateData.email !== undefined ? updateData.email : existingUser.email;
    const password = updateData.password !== undefined ? updateData.password : existingUser.password;
    const avatar = updateData.avatar !== undefined ? updateData.avatar : existingUser.avatar;
    const location = updateData.location !== undefined ? updateData.location : existingUser.location;
    const role = updateData.role !== undefined ? updateData.role : existingUser.role;
    const stats = updateData.stats !== undefined ? updateData.stats : existingUser.stats;
    const isActive = updateData.isActive !== undefined ? updateData.isActive : existingUser.is_active;

    const query = `
        UPDATE users 
        SET full_name = $1, email = $2, password = $3, avatar = $4, location = $5, role = $6, stats = $7, is_active = $8 
        WHERE id = $9 
        RETURNING *;
    `;
    
    const values = [fullName, email, password, avatar, location, role, stats, isActive, id];
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Kullanıcıyı veritabanından tamamen siler
export const deleteUserService = async (id) => {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};

// Kullanıcının kutularında (DailyBox) kullandığı tüm medyaları (audio, photo, doc) tek seferde toplu olarak getirir.
export const getUserMediaBoxesService = async (userId) => {
    const result = await pool.query(
        "SELECT * FROM boxes WHERE user_id = $1 AND (photo IS NOT NULL OR audio IS NOT NULL OR document IS NOT NULL)",
        [userId]
    );
    return result.rows;
};

// Şifre sıfırlama kodu kaydetme (15 dk geçerlilik, bekleme süresi kaydı)
export const setResetOtpService = async (email, otpCode) => {
    const result = await pool.query(
        `UPDATE users 
         SET reset_otp = $1, 
             reset_otp_expiry = NOW() + INTERVAL '15 minutes', 
             reset_otp_last_requested = NOW() 
         WHERE email = $2 RETURNING *`,
        [otpCode, email]
    );
    return result.rows[0];
};

// Şifreyi güncelleyip OTP kayıtlarını temizleme
export const clearResetOtpAndSetPasswordService = async (email, hashedPassword) => {
    const result = await pool.query(
        `UPDATE users 
         SET password = $1, 
             reset_otp = NULL, 
             reset_otp_expiry = NULL 
         WHERE email = $2 RETURNING *`,
        [hashedPassword, email]
    );
    return result.rows[0];
};