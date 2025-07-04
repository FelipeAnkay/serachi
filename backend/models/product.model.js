import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    finalPrice: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: "USD"
    },
    durationDays: {
        type: Number,
        default: 0
    },
    storeId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isTangible: {
        type: Boolean,
    },
    supplierId: {
        type: String
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const Product = mongoose.model('Product', productSchema);