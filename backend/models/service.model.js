import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    productId:{
        type: String,
        required: true
    },
    quoteId:{
        type: String,
        required: true
    },
    facilityId:{
        type: String,
    },
    staffEmail:{
        type: String,
    },
    customerEmail:{
        type: String,
    },
    dateIn: {
        type:Date
    },
    dateOut: {
        type:Date
    },
    storeId: {
        type:String,
        required: true
    },
    userEmail:{
        type:String,
        required: true
    },
    excecuted:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
    },
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Service = mongoose.model('Service', serviceSchema);