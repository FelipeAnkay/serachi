import mongoose from "mongoose";
const experienceSchema = new mongoose.Schema({
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
    productList:[{
        type: String,
        default: false
    }],
    storeId: {
        type:String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Experience = mongoose.model('Experience', experienceSchema);