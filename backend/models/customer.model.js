import mongoose from "mongoose";
const customerSchema = new mongoose.Schema({
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
    birthdate: {
        type:Date,
    },
    nationalId: {
        type:String,
    },
    storeId: {
        type:String,
        required: true
    }

},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Customer = mongoose.model('Customer', customerSchema);