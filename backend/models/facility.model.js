import mongoose from "mongoose";
const facilitySchema = new mongoose.Schema({
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
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Facility = mongoose.model('Facility', facilitySchema);