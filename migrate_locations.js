import pool from './src/config/db.js';

const migrateLocations = async () => {
    try {
        console.log("Starting migration...");
        
        // Drop the old columns
        await pool.query(`ALTER TABLE boxes DROP COLUMN IF EXISTS location_address;`);
        await pool.query(`ALTER TABLE boxes DROP COLUMN IF EXISTS location_lat;`);
        await pool.query(`ALTER TABLE boxes DROP COLUMN IF EXISTS location_lng;`);
        
        console.log("Old columns dropped.");
        
        // Add the new JSONB column
        await pool.query(`ALTER TABLE boxes ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT '[]'::jsonb;`);
        
        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
};

migrateLocations();
