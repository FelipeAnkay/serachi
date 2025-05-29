import mongoose from "mongoose";
const roomReservationSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
    quoteId: {
        type: String,
    },
    customerEmail: {
        type: String,
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
    bedsReserved: {
        type: Number,
        default: 1
    },
    roomUnitaryPrice: {
        type: Number
    },
    roomFinalPrice: { 
        type: Number 
    },
    currency: { 
        type: String,
        default: "USD", 
    },
    userEmail: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPaid: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const RoomReservation = mongoose.model('RoomReservation', roomReservationSchema);