import { createUserService, deleteUserService, getAllUsersService, getUserByIdService, updateUserService, getUserByEmailService, getUserMediaBoxesService } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

// Yeni bir kullanıcı kaydetme (Register)
export const registerUser = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;

        const userAvailable = await getUserByEmailService(email);

        if (userAvailable) {

            return handleResponse(res, 400, "User already registered!");
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = await createUserService({
            ...req.body, // Kullanıcının gönderdiği tüm verileri (avatar, location vs.) al
            password: hashedPassword // Sadece şifreyi ezip hashlenmiş halini koy
        });

        if (newUser) {
            // Şifreyi geri dönmemek için (güvenlik) videodaki gibi sadece id ve email dönüyoruz
            return handleResponse(res, 201, "User registered successfully", {
                id: newUser.id,
                email: newUser.email
            });
        } else {
            // Veritabanına kayıt başarısız olursa
            return handleResponse(res, 400, "User data is not valid");
        }
    } catch (error) {
        next(error); // Express 5 hatayı errorHandler'a yönlendirir
    }
};

// Kullanıcı girişi (Login)
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await getUserByEmailService(email);

        // Kullanıcı var mı ve şifreler eşleşiyor mu kontrolü
        if (user && (await bcrypt.compare(password, user.password))) {
            const accessToken = jwt.sign(
                {
                    user: {
                        fullName: user.full_name,
                        email: user.email,
                        id: user.id,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "90d" } // Mobil uygulama olduğu için oturumun 90 gün açık kalması idealdir.
            );

            
            return handleResponse(res, 200, "Login successful", { accessToken });
        } else {
            return handleResponse(res, 401, "Email or password is not valid!");
        }
    } catch (error) {
        next(error);
    }
};

// Şu an giriş yapmış olan kullanıcının bilgilerini getirme (Current)
export const currentUser = async (req, res, next) => {
    try {
        // validateToken bize sadece token'ın içine koyduğumuz temel bilgileri (id, email, fullName) getirdi.
        // Ama biz kullanıcının EN GÜNCEL tüm verilerini (avatar, stats, location vs.) istiyoruz.

        // req.user.id bilgisini kullanarak veritabanından adamın tüm güncel bilgilerini çekiyoruz:
        const fullUserData = await getUserByIdService(req.user.id);

        if (!fullUserData) {
            return handleResponse(res, 404, "User not found in database");
        }

        // Şifreyi frontend'e göndermemek için siliyoruz (Güvenlik)
        delete fullUserData.password;

        return handleResponse(res, 200, "Current user information", fullUserData);
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        // Artık req.body içindeki tüm veriyi (fullName, email, password, stats vb.) tek paket olarak yolluyoruz
        const newUser = await createUserService(req.body);
        handleResponse(res, 201, "User created successfully", newUser);
    } catch (error) {
        next(error);
    }
};

export const changePasswordController = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return handleResponse(res, 400, "Old and new passwords are required");
        }

        const user = await getUserByIdService(req.user.id);
        if (!user) {
            return handleResponse(res, 404, "User not found");
        }

        // Eski şifreyi doğrula
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return handleResponse(res, 400, "Old password is incorrect");
        }

        // Yeni şifreyi hash'le ve kaydet
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserService(req.user.id, { password: hashedPassword });

        return handleResponse(res, 200, "Password changed successfully");
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        handleResponse(res, 200, "Users fetched successfully", users);
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const user = await getUserByIdService(req.params.id);
        if (!user) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User fetched successfully", user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        // req.body paketini doğrudan yolluyoruz
        const updatedUser = await updateUserService(req.params.id, req.body);

        // Düzeltme: (!user) yerine (!updatedUser) kullanıldı
        if (!updatedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // 1. Kullanıcının mevcut verilerini getir
        const userToSil = await getUserByIdService(userId);
        if (!userToSil) {
            return handleResponse(res, 404, "User not found");
        }

        // 2. Avatarı Cloudinary'den sil
        if (userToSil.avatar) {
            try {
                const urlParts = userToSil.avatar.split('/');
                const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                const publicId = folderAndFile.split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Avatar silinirken Cloudinary hatası:", err);
            }
        }

        // 3. Kullanıcının tüm kutularındaki medyaları bul ve Cloudinary'den sil
        const boxes = await getUserMediaBoxesService(userId);
        if (boxes && boxes.length > 0) {
            for (const box of boxes) {
                // Fotoğrafları sil (image türü varsayılan)
                if (box.media_photos && box.media_photos.length > 0) {
                    for (const photoUrl of box.media_photos) {
                        try {
                            const url = typeof photoUrl === 'string' ? photoUrl : photoUrl.url;
                            if (url) {
                                const urlParts = url.split('/');
                                const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                                const publicId = folderAndFile.split('.')[0];
                                await cloudinary.uploader.destroy(publicId);
                            }
                        } catch (err) {
                            console.error("Fotoğraf silinirken hata:", err);
                        }
                    }
                }

                // Ses dosyalarını sil (resource_type: 'video')
                if (box.media_audio && box.media_audio.length > 0) {
                    for (const audioObj of box.media_audio) {
                        try {
                            const url = typeof audioObj === 'string' ? audioObj : audioObj.url; 
                            const urlParts = url.split('/');
                            const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                            const publicId = folderAndFile.split('.')[0];
                            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                        } catch (err) {
                            console.error("Ses dosyası silinirken hata:", err);
                        }
                    }
                }

                // Dökümanları sil (resource_type: 'raw' uzantı gerektirir)
                if (box.media_docs && box.media_docs.length > 0) {
                    for (const docObj of box.media_docs) {
                        try {
                            const url = typeof docObj === 'string' ? docObj : docObj.url;
                            const urlParts = url.split('/');
                            const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                            await cloudinary.uploader.destroy(folderAndFile, { resource_type: 'raw' });
                        } catch (err) {
                            console.error("Döküman silinirken hata:", err);
                        }
                    }
                }
            }
        }

        // 4. Veritabanından kullanıcıyı tamamen sil (ON DELETE CASCADE ile tüm bağlantılar silinir)
        const deletedUser = await deleteUserService(userId);

        if (!deletedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
        next(error);
    }
};

// Avatar Yükleme Controller'ı
export const uploadAvatarController = async (req, res, next) => {
    try {
        const userId = req.params.id; // Kullanıcı id'si URL'den gelir

        // Multer çalıştıysa dosya bilgileri req.file içindedir
        if (!req.file) {
            return handleResponse(res, 400, "Profile photo could not be uploaded.");
        }

        // Cloudinary'nin bize döndüğü güvenli URL
        const avatarUrl = req.file.path;

        // 1. Kullanıcının eski avatarını bul ve Cloudinary'den sil
        const currentUser = await getUserByIdService(userId);
        if (currentUser && currentUser.avatar) {
            try {
                const urlParts = currentUser.avatar.split('/');
                const folderAndFile = urlParts.slice(urlParts.length - 2).join('/');
                const publicId = folderAndFile.split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Eski avatar silinirken Cloudinary hatası:", err);
            }
        }

        // 2. Veritabanındaki kullanıcıyı güncelle
        const updatedUser = await updateUserService(userId, { avatar: avatarUrl });
        if (!updatedUser) {
            return handleResponse(res, 404, "User not found.");
        }

        // Şifreyi döndürmemek için güvenli bir kopya oluşturabiliriz
        const safeUser = { ...updatedUser };
        delete safeUser.password;

        handleResponse(res, 200, "Profile photo updated successfully.", safeUser);

    } catch (error) {
        console.error("Avatar yükleme hatası:", error);
        next(error);
    }
};