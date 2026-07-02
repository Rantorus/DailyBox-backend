import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pool from "./config/db.js";

import userRoutes from "./routes/userRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import chapterRoutes from "./routes/chapterRoutes.js" // Chapter rotamızı ekledik
import boxRoutes from "./routes/boxRoutes.js" // Box rotamızı ekledik
import todoRoutes from "./routes/todoRoutes.js" // Todo rotamızı ekledik
import errorHandling from "./middlewares/errorHandler.js";
import createTables from "./data/createTables.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// 1. KATMAN: Gelen İstekleri Karşılama
app.use(express.json());
app.use(cors());

// 2. KATMAN: Rotalar (İşlemlerin yapıldığı yer)
app.use("/api/users", userRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/boxes", boxRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/contacts", contactRoutes);

// 3. KATMAN: Güvenlik Ağı 
app.use(errorHandling);

// Create all tables before starting
createTables();

// TESTING DB Roması (Burası da bir rota olduğu için hata yönetiminden yukarıda kalmalı)
app.get("/", async (req, res, next) => { // Hata fırlatabilmesi için 'next' parametresini ekledik
    try {
        const result = await pool.query("SELECT current_database()");
        console.log("Veritabanı sorgusu başarılı.");
        res.send(`The database name is: ${result.rows[0].current_database}`);
    } catch (error) {
        // Önceden konsola yazdırıp res.send dönüyorduk, artık hatayı doğrudan errorHandling'e yolluyoruz
        next(error);
    }
});



app.listen(port, () => {
    console.log(`server running on port: ${port}`);
});