import mongoose from "mongoose";
const storeSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    mainEmail:{
        type:String,
        required: true,
        unique: true
    },
    storeId:{
        type:String,
        required: true,
        unique: true
    },
    address: {
        type:String,
        required: false
    },
    phone: {
        type:String,
        required: true
    },
    taxDefault: {
        type: Number,
    },
    userList: [{
        type:String,
        default: [""]
    }],
    timezone: {
        type:String,
        default: "",
    },
    filterList: [
        {
            _id: false,
            page: { type: String },
            category: { type: String },
            values: [{ type: String }]
        }
    ],
    isActive:{
        type: Boolean,
        default: true
    },
    daysClosed:[{
        type: Date
    }]
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Store = mongoose.model('Store', storeSchema);