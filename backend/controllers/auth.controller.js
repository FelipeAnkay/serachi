import bcrypt, { compare } from "bcryptjs";
import crypto from 'node:crypto';
import { User } from "../models/user.model.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendForgotPasswordEmail, sendResetPasswordSuccessEmail } from "../mailtrap/emails.js";
import { Service } from "../models/service.model.js";
import { Product } from "../models/product.model.js";
import { Store } from "../models/store.model.js"
import { Room } from "../models/room.model.js";
import { Book } from "../models/book.model.js";
import { Experience } from "../models/experience.model.js";
import { Customer } from "../models/customer.model.js";
import { Staff } from "../models/staff.model.js";

/* USER FUNCTIONS*/
export const signup = async (req, res) => {
    const { email, password, name, phone, roleList } = req.body;
    try {
        if (!email || !password || !name || !phone) {
            throw new Error("All fields are required");
        }
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            phone,
            verificationToken: verificationCode,
            roleList,
            verificationTokenexpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hrs
        })

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, user.verificationToken);

        res.status(201).json({
            success: true,
            message: "user created succesfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenexpiresAt: { $gt: Date.now() }
        })
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or Expired Code" })
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenexpiresAt = undefined;
        await user.save();
        console.log("User verified: ", user.email);
        const urlWelcome = process.env.CLIENT_URL + "/dashboard/";
        await sendWelcomeEmail(user.email, urlWelcome);
        res.status(200).json({
            success: true,
            message: "user verified succesfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }

}

export const login = async (req, res) => {
    const { storeId, email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        const store = await Store.findOne({ storeId });
        console.log("Usuario:", user);
        console.log("Store:", store);

        if (!user || !store) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        if (!store.userList.find((element) => element === email)) {
            return res.status(400).json({ success: false, message: "User not registrated in that company" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Wrong Password" });
        }
        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            message: "user logged in",
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error in loggin; ", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logged out OK" });
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        //Reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1 hr

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();
        console.log("usuario actualizado, accediendo al envío de mail");
        const urlBase = process.env.CLIENT_URL + "/reset-password/" + resetToken;
        await sendForgotPasswordEmail(user.email, urlBase);
        console.log("mail de reseteo enviado");

        res.status(200).json({
            success: true,
            message: "Forgot password send",
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error in loggin; ", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token.toString(),
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        //console.log("usuario actualizado, accediendo al envío de mail");

        await sendResetPasswordSuccessEmail(user.email);
        //console.log("mail de reseteo exitoso enviado");

        res.status(200).json({
            success: true,
            message: "Forgot password send",
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error in loggin; ", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        //console.log("Usuario en CheckAuth", user._doc); 
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            message: "User Checked in",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const usersCompany = async (req, res) => {
    try {
        const userList = await Store.findOne(req.storeId).select("userList");
        console.log("El listado de usuarios es:", userList);
        if (!userList) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, userList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}


export const serviceList = async (req, res) => {
    try {
        const storeId = req.storeId
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const serviceList = await Service.find(normalizeStoreID);
        console.log("El listado de productos es:", serviceList);
        if (!serviceList) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, serviceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

/*STORE FUNCTIONS */
export const createStore = async (req, res) => {
    const { name, mainEmail, address, storeId, phone } = req.body;

    try {
        if (!name || !mainEmail || !phone) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        console.log("Tienda normalizada: ", normalizedStoreId)

        const store = new Store({
            name,
            mainEmail,
            address,
            storeId: normalizedStoreId,
            phone
        });

        await store.save();

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            service: {
                ...store._doc
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateStore = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }
        const normalizedStoreId = id?.toUpperCase();
        const filter = { storeId: normalizedStoreId }
        const store = await Store.findOneAndUpdate(filter, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Store updated succesfully",
            service: {
                ...store._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

/*ROOM FUNCTIONS */
export const createRoom = async (req, res) => {
    const { name, availability, storeId } = req.body;
    try {
        if (!name || !availability || !storeId) {
            throw new Error("All fields are required");
        }

        const room = new Room({
            name,
            availability,
            storeId
        })

        await room.save();

        res.status(201).json({
            success: true,
            message: "Room created succesfully",
            service: {
                ...room._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateRoom = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const room = await Room.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "Room updated succesfully",
            service: {
                ...room._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

/*BOOK FUNCTIONS */
export const createBook = async (req, res) => {
    const { dateIn, dateOut, roomId, storeId, clientName, clientEmail, userId, clientQty } = req.body;
    try {
        if (!clientName || !dateIn || !dateOut || !roomId || !clientEmail || !storeId) {
            throw new Error("All fields are required");
        }

        const book = new Book({
            dateIn,
            dateOut,
            roomId,
            storeId,
            clientName,
            clientEmail,
            userId,
            clientQty
        })

        await book.save();

        res.status(201).json({
            success: true,
            message: "Book created succesfully",
            service: {
                ...book._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateBook = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const book = await Book.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Book updated succesfully",
            service: {
                ...book._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

/*EXPERIENCE FUNCTIONS */
export const createExperience = async (req, res) => {
    const { name, serviceList, productList, bookList, storeId, userId, customerEmail, dateIn, dateOut } = req.body;
    try {

        const hasAnyItem = serviceList.length > 0 || productList.length > 0 || bookList.length > 0;
        if (!hasAnyItem) {
            throw new Error("At least one of serviceList, productList or bookList must have items");
        }

        if (!name || !dateIn || !dateOut || !storeId || !customerEmail) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const experience = new Experience({
            name,
            serviceList,
            productList,
            bookList,
            storeId: normalizedStoreId,
            userId,
            customerEmail,
            dateIn,
            dateOut
        });

        await experience.save();

        res.status(201).json({
            success: true,
            message: "Experience created succesfully",
            service: {
                ...experience._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateExperience = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const experience = await Experience.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Experience updated succesfully",
            service: {
                ...experience._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const experienceList = async (req, res) => {
    try {
        const experienceList = await Experience.find(req.storeId);
        console.log("El listado de experiencias es:", experienceList);
        if (!experienceList) {
            return res.status(400).json({ success: false, message: "Experiences not found" });
        }
        res.status(200).json({ success: true, experienceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

/*SERVICE FUNCTIONS */
export const createService = async (req, res) => {
    const { name, finalPrice, currency, productId, staffEmail, customerEmail, dateIn, dateOut, storeId, userId } = req.body;
    try {
        if (!name || !finalPrice || !currency || !productId || !staffEmail || !customerEmail || !dateIn || !dateOut || !storeId || !userId) {
            throw new Error("All fields are required");
        }

        const normalizeStoreID = storeId?.toUpperCase();

        const service = new Service({
            name,
            finalPrice,
            currency,
            productId,
            staffEmail,
            customerEmail,
            dateIn,
            dateOut,
            userId,
            storeId: normalizeStoreID
        })

        await service.save();

        res.status(201).json({
            success: true,
            message: "service created succesfully",
            service: {
                ...service._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateService = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const service = await Service.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "service updated succesfully",
            service: {
                ...service._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const getServiceById = async (req, res) => {
    try {
        const {id} = req.body;
        const service = await Service.findById(id);
        if (!service) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, service });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

/*Product FUNCTIONS */
export const createProduct = async (req, res) => {
    const { name, price, currency, type, userId, storeId, durationDays } = req.body;
    try {
        if (!name || !price || !type || !storeId || !currency) {
            throw new Error("All fields are required");
        }

        const normalizeStoreID = storeId?.toUpperCase();

        const product = new Product({
            name,
            price,
            currency,
            type,
            userId,
            durationDays,
            storeId: normalizeStoreID
        })

        await product.save();

        res.status(201).json({
            success: true,
            message: "product created succesfully",
            service: {
                ...product._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const productList = async (req, res) => {
    try {
        const storeId = req.storeId
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const productList = await Product.find(normalizeStoreID);
        console.log("El listado de productos es:", productList);
        if (!productList) {
            return res.status(400).json({ success: false, message: "Products not found" });
        }
        res.status(200).json({ success: true, productList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getProductById = async (req, res) => {
    try {
        const {id} = req.body;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(400).json({ success: false, message: "product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

/*Customer FUNCTIONS */
export const createCustomer = async (req, res) => {
    const { name, email, phone, country, birthdate, nationalId, storeId } = req.body;
    try {
        if (!name || !email || !phone || !country || !birthdate || !nationalId || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const customer = new Customer({
            name,
            email,
            phone,
            country,
            birthdate,
            nationalId,
            storeId: normalizedStoreId
        });

        await customer.save();

        res.status(201).json({
            success: true,
            message: "Customer created succesfully",
            service: {
                ...customer._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateCustomer = async (req, res) => {
    const { email, ...updateFields } = req.body;
    try {
        if (!email) {
            throw new Error("Id field is required");
        }

        const customer = await Customer.findOneAndUpdate(email, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Customer updated succesfully",
            service: {
                ...customer._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const customerList = async (req, res) => {
    try {
        const storeId = req.storeId
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const customerList = await Customer.find(normalizeStoreID);
        console.log("El listado de clientes es:", customerList);
        if (!customerList) {
            return res.status(400).json({ success: false, message: "Customer not found" });
        }
        res.status(200).json({ success: true, customerList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

/*Staff FUNCTIONS */
export const createStaff = async (req, res) => {
    const { name, email, phone, country, birthdate, nationalId, professionalCertificates, storeId } = req.body;
    try {
        if (!name || !email || !phone || !country || !birthdate || !nationalId || !storeId || !professionalCertificates) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const staff = new Staff({
            name,
            email,
            phone,
            country,
            birthdate,
            nationalId,
            professionalCertificates,
            storeId: normalizedStoreId
        });

        await staff.save();

        res.status(201).json({
            success: true,
            message: "Staff created succesfully",
            service: {
                ...staff._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const staffList = async (req, res) => {
    try {
        const storeId = req.storeId
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const staffList = await Staff.find({ storeId: normalizeStoreID });
        console.log("El listado de Staff es:", staffList);
        if (!staffList || staffList.length === 0) {
            return res.status(400).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, staffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const updateStaff = async (req, res) => {
    const { email, storeId, ...updateFields } = req.body;
    try {
        if (!email || !storeId) {
            throw new Error("Id field is required");
        }

        const staff = await Staff.findOne(email);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        const normalizedStoreId = storeId.toUpperCase();
        const hasStore = staff.storeId.includes(normalizedStoreId);

        if (!hasStore) {
            return res.status(403).json({ success: false, message: "StoreID not authorized for this staff" });
        }
        Object.assign(staff, updateFields);
        await staff.save();

        res.status(201).json({
            success: true,
            message: "Staff updated succesfully",
            service: {
                ...staff._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}