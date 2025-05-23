import mongoose from "mongoose";
const roomReservationSchema = new mongoose.Schema({
    roomId: {
        type:String,
        required: true
    },
    quoteId:{
        type:String,
        required: true,
    },
    customerEmail:{
        type: String,
    },
    storeId:{
        type:String,
        required: true,
    },
    dateIn:{
        type:Date,
        required: true,
    },
    dateOut:{
        type: Date,
        default:"USD"
    },
    bedsReserved: { 
        type: Number, 
        default: 1 
    },
    userEmail:{
        type: String,
        required: true
    },
    isActive:{
        type:Boolean,
        default: true
    }
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const RoomReservation = mongoose.model('RoomReservation', roomReservationSchema);