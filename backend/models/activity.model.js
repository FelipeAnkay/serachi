import mongoose from "mongoose";
const activitySchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    price: {
        type:Number,
        required: true
    },
    currency: {
        type:String,
        default: "USD"
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Activity = mongoose.model('Activity', activitySchema);