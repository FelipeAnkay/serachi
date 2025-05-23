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
    type:{
        type: String,
    },
    storeId:{
        type:String,
        required: true,
    },
    price:{
        type:Number,
        required: true,
    },
    currency:{
        type: String,
        default:"USD"
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

export const Room = mongoose.model('Room', roomSchema);