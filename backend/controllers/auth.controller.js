import bcrypt, { compare } from "bcryptjs";
import crypto from 'node:crypto';
import { User } from "../models/user.model.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendForgotPasswordEmail, sendResetPasswordSuccessEmail } from "../mailtrap/emails.js";
import { Store } from "../models/store.model.js"


/* USER FUNCTIONS*/
export const signup = async (req, res) => {
    const { email, password, name, phone, role } = req.body;
    const lowEmail = email.toLowerCase();
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
            email: lowEmail,
            password: hashedPassword,
            name,
            phone,
            verificationToken: verificationCode,
            role,
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
        //console.log("User verified: ", user.email);
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
    let { storeId, email, password } = req.body;

    try {
        // Convertimos a minúsculas para evitar problemas de mayúsculas/minúsculas
        email = email.toLowerCase();

        const user = await User.findOne({ email });
        const store = await Store.findOne({ storeId });

        //console.log("Usuario:", user);
        //console.log("Store:", store);

        if (!user || !store) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // También convertimos los correos en userList a minúsculas para comparar correctamente
        const storeUserEmails = store.userList.map(e => e.toLowerCase());
        if (!storeUserEmails.includes(email)) {
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
        });

    } catch (error) {
        console.log("Error in login: ", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

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
        //console.log("usuario actualizado, accediendo al envío de mail");
        const urlBase = process.env.CLIENT_URL + "/reset-password/" + resetToken;
        await sendForgotPasswordEmail(user.email, urlBase);
        //console.log("mail de reseteo enviado");

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
        //console.log("Usuario en CheckAuth", user); 
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
export const updateUser = async (req, res) => {
    const { email, ...updateFields } = req.body;
    //console.log("B: Entre a updateUser", email, " - ", updateFields)
    try {
        if (!email) {
            throw new Error("Id field is required");
        }

        const user = await User.findOneAndUpdate({ email }, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "user updated succesfully",
            user: {
                ...user._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getUsersByEmails = async (req, res) => {
    try {
        //console.log("Entre a staffByEmail")
        const { emails, storeId } = req.params
        const arrayEmails = emails.split(",");
        //console.log("B: el storeID para staffByEmail es: ", email)
        if (!emails) {
            throw new Error("Email is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const userList = await User.find({ email: { $in: arrayEmails } }).select('-password');
        //console.log("El listado de Staff es:", staffList);
        if (!userList || userList.length === 0) {
            return res.status(200).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, userList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getUserByEmail = async (req, res) => {
    try {
        //console.log("Entre a staffByEmail")
        const { email } = req.params
        //console.log("B: el storeID para staffByEmail es: ", email)
        if (!email) {
            throw new Error("Email is required");
        }
        const userFound = await User.findOne({
            email: email,
        }).select('-password');
        //console.log("El listado de userList es:", userFound);
        if (!userFound) {
            return res.status(200).json({ success: false, message: "userList not found" });
        }
        res.status(200).json({ success: true, user: userFound });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

