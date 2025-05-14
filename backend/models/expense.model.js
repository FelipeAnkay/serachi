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

const expenseSchema = new mongoose.Schema({
    description:{
        type:String
    },
    date: {
        type: Date,
        required: true
    },
    supplierId: {
        type: String
    },
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

export const Expense = mongoose.model('Expense', expenseSchema);