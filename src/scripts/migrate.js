import pool from '../config/db.js';

async function migrate() {
    try {
        console.log("Starting migration...");

        // 1. Add temporary JSONB columns
        await pool.query(`
            ALTER TABLE boxes 
            ADD COLUMN IF NOT EXISTS media_photos_new JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS media_audio_new JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS media_docs_new JSONB DEFAULT '[]'::jsonb;
        `);
        console.log("Added temporary columns.");

        // 2. Fetch all boxes
        const result = await pool.query('SELECT id, media_photos, media_audio, media_docs FROM boxes');
        const boxes = result.rows;

        // 3. Migrate data row by row
        for (let box of boxes) {
            let newPhotos = [];
            let newAudio = [];
            let newDocs = [];

            if (box.media_photos && box.media_photos.length > 0) {
                newPhotos = box.media_photos.map(url => ({
                    url: url,
                    name: decodeURIComponent(url.split('/').pop())
                }));
            }

            if (box.media_audio && box.media_audio.length > 0) {
                newAudio = box.media_audio.map(url => ({
                    url: url,
                    name: decodeURIComponent(url.split('/').pop())
                }));
            }

            if (box.media_docs && box.media_docs.length > 0) {
                newDocs = box.media_docs.map(url => ({
                    url: url,
                    name: decodeURIComponent(url.split('/').pop())
                }));
            }

            await pool.query(`
                UPDATE boxes 
                SET media_photos_new = $1::jsonb,
                    media_audio_new = $2::jsonb,
                    media_docs_new = $3::jsonb
                WHERE id = $4
            `, [JSON.stringify(newPhotos), JSON.stringify(newAudio), JSON.stringify(newDocs), box.id]);
        }
        console.log("Migrated data to temporary columns.");

        // 4. Drop old columns and rename new ones
        await pool.query(`
            ALTER TABLE boxes 
            DROP COLUMN media_photos,
            DROP COLUMN media_audio,
            DROP COLUMN media_docs;

            ALTER TABLE boxes
            RENAME COLUMN media_photos_new TO media_photos;

            ALTER TABLE boxes
            RENAME COLUMN media_audio_new TO media_audio;

            ALTER TABLE boxes
            RENAME COLUMN media_docs_new TO media_docs;
        `);
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
