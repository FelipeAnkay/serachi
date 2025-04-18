import bcrypt, { compare } from "bcryptjs";
import crypto from 'node:crypto';
import { User } from "../models/user.model.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendForgotPasswordEmail, sendResetPasswordSucessEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {
    const {email, password, name} = req.body;
    try{
        if (!email || !password || !name){
            throw new Error("All fields are required");
        }
        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({sucess: false, message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken: verificationCode,
            verificationTokenexpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hrs
        })

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, user.verificationToken);

        res.status(201).json({
            sucess: true,
            message: "user created succesfully",
            user:{
                ...user._doc,
                password: undefined
            }
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenexpiresAt: {$gt: Date.now()}
        })
        if(!user){
            return res.status(400).json({sucess: false, message: "Invalid or Expired Code"})
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenexpiresAt = undefined;
        await user.save();
        console.log("User verified: ", user.email);
        const urlWelcome = process.env.CLIENT_URL + "/dashboard/";
        await sendWelcomeEmail(user.email, urlWelcome);
        res.status(200).json({
            sucess: true,
            message: "user verified succesfully",
            user:{
                ...user._doc,
                password: undefined
            }
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }

}

export const login = async (req, res) => {
    const {email, password} =  req.body;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({sucess: false, message: "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid){
            return res.status(400).json({sucess: false, message: "Wrong Password"});
        }
        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            sucess: true,
            message: "user logged in",
            user:{
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error in loggin; ", error.message);
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({sucess: true, message: "Logged out OK"});
}

export const forgotPassword = async (req, res) => {
    const {email} =  req.body;
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({sucess: false, message: "Invalid credentials"});
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
            sucess: true,
            message: "Forgot password send",
            user:{
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error in loggin; ", error.message);
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} =  req.body;
        
        const user = await User.findOne({
            resetPasswordToken: token.toString(),
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({sucess: false, message: "User not found"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
       
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        console.log("usuario actualizado, accediendo al envío de mail");

        await sendResetPasswordSucessEmail(user.email);
        console.log("mail de reseteo exitoso enviado");

        res.status(200).json({
            sucess: true,
            message: "Forgot password send",
            user:{
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error in loggin; ", error.message);
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(400).json({sucess: false, message: "User not found"});
        }
        res.status(200).json({sucess: true, user});
    } catch (error) {
        return res.status(400).json({sucess: false, message: error.message});
    }
}