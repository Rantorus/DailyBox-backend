import pool from '../config/db.js';

async function migrateStatus() {
    try {
        console.log("Starting status migration...");

        await pool.query(`
            ALTER TABLE boxes 
            DROP COLUMN status;
        `);
        console.log("Dropped old status column (VARCHAR).");

        await pool.query(`
            ALTER TABLE boxes 
            ADD COLUMN status BOOLEAN DEFAULT false;
        `);
        console.log("Added new status column (BOOLEAN DEFAULT false).");

        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrateStatus();
