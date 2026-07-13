import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

async function migrate() {
  try {
    await client.connect();
    console.log("Connected to database.");

    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6);`);
    console.log("Added reset_otp column.");

    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMP WITH TIME ZONE;`);
    console.log("Added reset_otp_expiry column.");

    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_last_requested TIMESTAMP WITH TIME ZONE;`);
    console.log("Added reset_otp_last_requested column.");

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
