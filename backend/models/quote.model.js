import mongoose from "mongoose";
const tagSchema = new mongoose.Schema({
    name: {
        type:String,
        required: false
    },
    code: {
        type:String,
        required: false
    }
}, { _id: false }); 
const quoteSchema = new mongoose.Schema({
    dateIn: {
        type:Date,
        required: true
    },
    dateOut: {
        type:Date,
        required: true
    },
    customerEmail: {
        type:String,
        required: true
    },
    storeId: {
        type:String,
        required: true
    },
    roomId: {
        type:String
    },
    partnerId: {
        type:String
    },
    productList: [
        {
            _id: false,
            productID: { type: String },
            productName: { type: String },
            Qty: { type: Number },
            productUnitaryPrice: { type: Number },
            productFinalPrice: { type: Number }
        }
    ],
    discount:{
        type:Number
    },
    finalPrice:{
        type:Number
    },
    currency:{
        type:String,
        default:"USD"
    },
    isConfirmed:{
        type: Boolean,
        default: false  
    },
    isReturningCustomer:{
        type: Boolean,
        default: false  
    },
    tag:[tagSchema],
    userEmail:{
        type:String,
        required: true
    },
    source:{
        type:String
    },
    customSource:{
        type:String
    }
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Quote = mongoose.model('Quote', quoteSchema);