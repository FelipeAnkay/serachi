import mongoose from "mongoose";
const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    code: {
        type: String,
        required: false
    }
}, { _id: false });

const incomeSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    customerEmail: {
        type: String,
    },
    partnerId: {
        type: String
    },
    quoteId: {
        type: String,

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
    currency: {
        type: String,
        default: "USD"
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    tag: [tagSchema],
    userEmail: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const Income = mongoose.model('Income', incomeSchema);