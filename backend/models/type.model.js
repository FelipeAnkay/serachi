import mongoose from "mongoose";
const typeSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    category: {
        type:String,
        required: true
    },
    storeId: {
        type:String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    }
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Type = mongoose.model('Type', typeSchema);