import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    serviceList: [{
        type: String,
    }],
    productList: [
        {
            _id: false,
            productId: { type: String },
            Qty: { type: Number },
            price: {type: Number},
            isPaid: { type: Boolean }
        }
    ],
    bookList: [{
        type: String,
    }],
    storeId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    dateIn: {
        type: Date
    },
    dateOut: {
        type: Date
    },
    quoteId:{
        type:String,
    },
    source:{
        type:String,
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const Experience = mongoose.model('Experience', experienceSchema);