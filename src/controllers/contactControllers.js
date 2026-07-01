// Standart hata formatımız
const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

// ==========================================
// 1. KULLANICININ KENDİ CONTACTLARINI GETİR (GET)
// ==========================================
export const getContacts = async (req, res, next) => {
    try {
        // MANTIK: Veritabanına gidip "SELECT * FROM contacts WHERE user_id = req.user.id" diyoruz.
        // Böylece adam başkasının contact'larını göremez.
        // const contacts = await getContactsByUserId(req.user.id);
        
        return handleResponse(res, 200, "Sadece senin (req.user.id) rehberin getirildi");
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 2. YENİ BİR CONTACT EKLE (POST)
// ==========================================
export const createContact = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        // MANTIK: Contact oluştururken user_id olarak frontend'in yolladığı veriyi değil, 
        // doğrudan güvenlik görevlisinin yakaladığı token'dan (req.user.id) gelen KESİN veriyi kullanıyoruz!
        // INSERT INTO contacts (name, phone, user_id) VALUES (name, phone, req.user.id)
        
        return handleResponse(res, 201, "Rehberine yeni kişi başarıyla (req.user.id imzasıyla) eklendi");
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. CONTACT GÜNCELLE (PUT)
// ==========================================
export const updateContact = async (req, res, next) => {
    try {
        const contactId = req.params.id;

        // Adım 1: Önce güncellenmek istenen contact veritabanında var mı diye buluyoruz
        // const contact = await getContactById(contactId);

        // Adım 2: GÜVENLİK POLİSİ (Authorization) - EN KRİTİK YER!
        // Veritabanındaki contact'ın asıl sahibi ile (contact.user_id)
        // İşlemi yapmaya çalışan token sahibi (req.user.id) AYNI KİŞİ Mİ?
        /*
        if (contact.user_id !== req.user.id) {
            return handleResponse(res, 403, "Hop hemşerim nereye! Başkasının verisini güncelleyemezsin.");
        }
        */

        // Adım 3: Aynı kişiyse güncellemeyi yap
        // await updateContactInDb(contactId, req.body);
        
        return handleResponse(res, 200, "Rehberin başarıyla güncellendi (Sahiplik doğrulandı)");
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. CONTACT SİL (DELETE)
// ==========================================
export const deleteContact = async (req, res, next) => {
    try {
        const contactId = req.params.id;

        // Adım 1: Silinmek istenen contact'ı bul
        // const contact = await getContactById(contactId);

        // Adım 2: GÜVENLİK POLİSİ (Authorization)
        /*
        if (contact.user_id !== req.user.id) {
            return handleResponse(res, 403, "Hop hemşerim nereye! Başkasının verisini silemezsin.");
        }
        */

        // Adım 3: Aynı kişiyse silme işlemini yap
        // await deleteContactFromDb(contactId);
        
        return handleResponse(res, 200, "Kişi rehberinden başarıyla silindi (Sahiplik doğrulandı)");
    } catch (error) {
        next(error);
    }
};
