import bcrypt, { compare } from "bcryptjs";
import crypto from 'node:crypto';
import { User } from "../models/user.model.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendForgotPasswordEmail, sendResetPasswordSucessEmail } from "../mailtrap/emails.js";
import { Service } from "../models/service.model.js";
import { Product } from "../models/product.model.js";
import { Store } from "../models/store.model.js"
import { Room } from "../models/room.model.js";
import { Book } from "../models/book.model.js";

/* USER FUNCTIONS*/
export const signup = async (req, res) => {
    const {email, password, name, phone} = req.body;
    try{
        if (!email || !password || !name || !phone){
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
            phone,
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
    const {storeId,email, password} =  req.body;
    try {
        const user = await User.findOne({email});
        const store = await Store.findOne({storeId});

        if (!user || !store) {
            return res.status(400).json({sucess: false, message: "Invalid credentials"});
        }
        if(!store.userList.find((element) => element === email)){
            return res.status(400).json({sucess: false, message: "User not registrated in that company"});
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
        const user = await User.findById(req.userId).select("password");
        if(!user){
            return res.status(400).json({sucess: false, message: "User not found"});
        }
        res.status(200).json({sucess: true, user});
    } catch (error) {
        return res.status(400).json({sucess: false, message: error.message});
    }
}

/*SERVICE FUNCTIONS */
export const createService = async (req, res) => {
    const {name, price, currency, storeId, userId, productList} = req.body;
    try{
        if (!name || !price || !currency || !storeId || !productList){
            throw new Error("All fields are required");
        }

        const service = new Service({
            name,
            price,
            currency,
            productList,
            userId,
            storeId
        })

        await service.save();

        res.status(201).json({
            sucess: true,
            message: "service created succesfully",
            service:{
                ...service._doc
            }
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const updateService = async (req, res) => {
    const  { id, ...updateFields } = req.body;
    try{
        if (!id){
            throw new Error("Id field is required");
        }

        const service = await Service.findByIdAndUpdate(id, updateFields, {
            new: true
          });

        //await service.save();

        res.status(201).json({
            sucess: true,
            message: "service updated succesfully",
            service:{
                ...service._doc
            }   
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

/*Product FUNCTIONS */
export const createProduct = async (req, res) => {
    const {name, price, currency, userId, storeId} = req.body;
    try{
        if (!name || !price || !storeId || !currency){
            throw new Error("All fields are required");
        }

        const product = new Product({
            name,
            price,
            currency,
            userId,
            storeId
        })

        await product.save();

        res.status(201).json({
            sucess: true,
            message: "product created succesfully",
            service:{
                ...product._doc
            }
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

/*STORE FUNCTIONS */
export const createStore = async (req, res) => {
    const {name, mainEmail, address, storeId ,phone} = req.body;
    try{
        if (!name || !mainEmail || !phone){
            throw new Error("All fields are required");
        }

        const store = new Store({
            name,
            mainEmail,
            address,
            storeId,
            phone
        })

        await store.save();

        res.status(201).json({
            sucess: true,
            message: "Store created succesfully",
            service:{
                ...store._doc
            }
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const updateStore = async (req, res) => {
    const  { id, ...updateFields } = req.body;
    try{
        if (!id){
            throw new Error("Id field is required");
        }

        const store = await Store.findByIdAndUpdate(id, updateFields, {
            new: true
          });

        //await service.save();

        res.status(201).json({
            sucess: true,
            message: "Store updated succesfully",
            service:{
                ...store._doc
            }   
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

/*ROOM FUNCTIONS */
export const createRoom = async (req, res) => {
    const {name, availability, storeId} = req.body;
    try{
        if (!name || !availability || !storeId){
            throw new Error("All fields are required");
        }

        const room = new Room({
            name,
            availability,
            storeId
        })

        await room.save();

        res.status(201).json({
            sucess: true,
            message: "Room created succesfully",
            service:{
                ...room._doc
            }
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const updateRoom = async (req, res) => {
    const  { id, ...updateFields } = req.body;
    try{
        if (!id){
            throw new Error("Id field is required");
        }

        const room = await Room.findByIdAndUpdate(id, updateFields, {
            new: true
          });

        //await service.save();

        res.status(201).json({
            sucess: true,
            message: "Room updated succesfully",
            service:{
                ...room._doc
            }   
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

/*BOOK FUNCTIONS */
export const createBook = async (req, res) => {
    const {dateIn, dateOut, roomId, storeId, clientName, clientEmail, userId, clientQty } = req.body;
    try{
        if (!clientName || !dateIn || !dateOut || !roomId || !clientEmail || !storeId){
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
            sucess: true,
            message: "Book created succesfully",
            service:{
                ...book._doc
            }
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}

export const updateBook = async (req, res) => {
    const  { id, ...updateFields } = req.body;
    try{
        if (!id){
            throw new Error("Id field is required");
        }

        const book = await Book.findByIdAndUpdate(id, updateFields, {
            new: true
          });

        res.status(201).json({
            sucess: true,
            message: "Book updated succesfully",
            service:{
                ...book._doc
            }   
        })

    }catch (error){
        res.status(400).json({sucess: false, message: error.message});
    }
}