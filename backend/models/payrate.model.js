import mongoose from "mongoose";
const payrateSchema = new mongoose.Schema({
    staffEmail: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    feeRules:[{
        _id: false,
        timeframe:{
            type: String,
        },
        operator:{
            type: String,
        },
        value:{
            type: Number,
        },
        fee:{
            type:Number
        }
    }],
    currency: {
        type: String,
        default: "USD"
    },
    userEmail: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    },
    startDate:{
        type:Date,
    },
    finishDate:{
        type:Date,
    },
    priority:{
        type: Number,
        default: 9,
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const PayRate = mongoose.model('Payrate', payrateSchema);