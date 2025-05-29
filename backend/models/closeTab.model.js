import mongoose from "mongoose";

const closetabSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    userEmail: {
        type: String,
    },
    customerEmail: {
        type: String,
    },
    closedAmount: {
        type: String,
    },
    productList: [
        {
            _id: false,
            productId: { type: String },
            Qty: { type: Number },
            amount: { type: Number },
        }
    ],
    serviceList: [
        {
            _id: false,
            serviceId: { type: String },
            Qty: { type: Number },
            amount: { type: Number },
        }
    ],
    reservationList: [
        {
            _id: false,
            reservationId: { type: String },
            Qty: { type: Number },
            amount: { type: Number },
        }
    ],
    storeId: {
        type: String,
        required: true
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const closeTab = mongoose.model('closeTab', closetabSchema);