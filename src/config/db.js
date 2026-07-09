import pkg from "pg";
import dotenv from "dotenv"

const { Pool } = pkg;

dotenv.config();

const pool = new Pool(
    process.env.DB_URL
        ? { connectionString: process.env.DB_URL }
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

export default pool;