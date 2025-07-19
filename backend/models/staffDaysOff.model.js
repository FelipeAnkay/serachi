import mongoose from "mongoose";
const staffDaysOffSchema = new mongoose.Schema({
    staffEmail: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true,
    },
    dateIn: {
        type: Date,
        required: true,
    },
    dateOut: {
        type: Date,
        required: true,
    },
    userEmail: {
        type: String,
        required: true
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const StaffDaysOff = mongoose.model('StaffDaysOff', staffDaysOffSchema);