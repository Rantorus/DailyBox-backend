import pool from './src/config/db.js';

async function alterTable() {
    try {
        console.log("Checking and adding missing columns to 'boxes' table...");
        
        await pool.query(`
            ALTER TABLE boxes 
            ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(10)
        `);
        console.log("Added column: reminder_time");

        await pool.query(`
            ALTER TABLE boxes 
            ADD COLUMN IF NOT EXISTS is_reminder_alarm BOOLEAN DEFAULT FALSE
        `);
        console.log("Added column: is_reminder_alarm");

        console.log("Database migration successful!");
    } catch (e) {
        console.error("Migration failed: ", e.message);
    } finally {
        await pool.end();
    }
}

alterTable();
