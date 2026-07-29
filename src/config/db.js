import pkg from "pg";
import dotenv from "dotenv"

const { Pool } = pkg;

dotenv.config();

const pool = new Pool(
    process.env.DB_URL
        ? { 
            connectionString: process.env.DB_URL,
            ssl: { rejectUnauthorized: false }
          }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        }
);

pool.on("connect", ()=>{
    console.log("connection pool ok with DB");
})

// Auto-migration to ensure columns exist in production
const ensureSchema = async () => {
    try {
        await pool.query(`
            ALTER TABLE boxes 
            ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(10)
        `);
        await pool.query(`
            ALTER TABLE boxes 
            ADD COLUMN IF NOT EXISTS is_reminder_alarm BOOLEAN DEFAULT FALSE
        `);
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS storage_used BIGINT DEFAULT 0
        `);
        console.log("Database schema auto-updated for reminder fields.");
    } catch (err) {
        console.error("Error auto-updating database schema:", err.message);
    }
};

ensureSchema();

export default pool;