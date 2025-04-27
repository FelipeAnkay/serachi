import mongoose from "mongoose";
const serviceSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    finalPrice: {
        type:Number,
        required: true
    },
    currency: {
        type:String,
        default: "USD"
    },
    productId:{
        type: String,
        required: true
    },
    facilityId:{
        type: String,
    },
    staffEmail:{
        type: String,
        default: false
    },
    customerEmail:{
        type: String,
        default: false
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
    userId:{
        type:String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Service = mongoose.model('Service', serviceSchema);