import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    name: {
        type:String,
        required: true
    },
    phone: {
        type:String,
        required: true
    },
    lastLogin: {
        type:Date,
        default: Date.now
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
    },
    resetPasswordToken:String,
    resetPasswordExpiresAt:Date,
    verificationToken: String,
    verificationTokenexpiresAt:Date,

},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const User = mongoose.model('User', userSchema);