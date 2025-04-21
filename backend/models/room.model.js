import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    availability:{
        type:Number,
        required: true,
    },
    storeId:{
        type:String,
        required: true,
    },
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Room = mongoose.model('Room', roomSchema);