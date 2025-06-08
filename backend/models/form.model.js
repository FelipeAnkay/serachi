import mongoose from "mongoose";
const formSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const Form = mongoose.model('Form', formSchema);