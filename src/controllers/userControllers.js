import { createUserService, deleteUserService, getAllUsersService, getUserByIdService, updateUserService, getUserByEmailService } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
        console.log("hashed password: ", hashedPassword);

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
                        // DÜZELTME 1: "usarname" yazım hatası vardı ve bizim veritabanımızda kolonun adı "full_name"
                        fullName: user.full_name,
                        email: user.email,
                        id: user.id,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "2h" } // Test için 2 saat yapıldı. Canlı uygulamada "30d" (30 gün) yapmalısın.
            );

            // DÜZELTME 2: Standart handleResponse mimarimizi kullanıyoruz
            return handleResponse(res, 200, "Login successful", { accessToken });
        } else {
            // DÜZELTME 3: throw Error yerine yine standart hata mimarimizi dönüyoruz (Böylece loglarda çirkin kırmızı hatalar çıkmaz)
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
        const deletedUser = await deleteUserService(req.params.id);

        // Düzeltme: (!user) yerine (!deletedUser) kullanıldı
        if (!deletedUser) return handleResponse(res, 404, "User not found");
        handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (error) {
        next(error);
    }
};