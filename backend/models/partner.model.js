import mongoose from "mongoose";
const partnerSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    name: {
        type:String,
        required: true
    },
    phone: {
        type:String,
    },
    country: {
        type:String,
    },
    nationalId: {
        type:String,
    },
    storeId: {
        type:String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true,
    }

},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Partner = mongoose.model('Partner', partnerSchema);