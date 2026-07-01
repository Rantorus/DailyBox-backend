import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTables = async () => {
    try {
        // schema.sql dosyasının yolunu buluyoruz
        const schemaPath = path.join(__dirname, "../config/schema.sql");
        const schemaQuery = fs.readFileSync(schemaPath, { encoding: "utf-8" });

        // SQL dosyasını çalıştırıyoruz
        await pool.query(schemaQuery);
        console.log("Tüm tablolar (Users, Chapters, Boxes, BoxTodos) başarıyla oluşturuldu/doğrulandı.");
    } catch (error) {
        console.log("Tablolar oluşturulurken hata meydana geldi: ", error);
    }
};

export default createTables;
