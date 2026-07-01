import jwt from "jsonwebtoken";

// Bizim mimariye uygun standart hata mesajı döndüren yardımcı fonksiyon (İstersen bunu ayrı bir dosyaya da alabiliriz ama şimdilik burada kalsın)
const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

export const validateToken = async (req, res, next) => {
    try {
        let token;
        let authHeader = req.headers.Authorization || req.headers.authorization;

        // Header'da Authorization kelimesi var mı ve Bearer ile başlıyor mu?
        if (authHeader && authHeader.startsWith("Bearer")) {
            // "Bearer asd123token" stringini boşluktan bölüp [1]. indexi (yani tokeni) alıyoruz
            token = authHeader.split(" ")[1];

            // Senkron olarak tokenı doğruluyoruz (callback kullanmaktan daha güvenli)
            // Hata çıkarsa catch bloğuna düşer
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // Çözülmüş tokenın içindeki user bilgisini request objesine yapıştırıyoruz
            // Böylece sonraki fonksiyon (currentUser) bu bilgiye req.user üzerinden erişebilir
            req.user = decoded.user;

            next(); // Geçiş izni ver
        }

        if (!token) {
            return handleResponse(res, 401, "User is not authorized or token is missing");
        }
    } catch (error) {
        // Token süresi dolmuşsa veya sahteyse bu bloğa düşer
        return handleResponse(res, 401, "User is not authorized, token failed");
    }
};
