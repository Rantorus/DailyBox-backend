import pool from "../config/db.js";

async function alterTable() {
    try {
        await pool.query(`
            ALTER TABLE chapters 
            ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'General';
        `);
        console.log("Columns added successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error adding columns", error);
        process.exit(1);
    }
}
alterTable();
