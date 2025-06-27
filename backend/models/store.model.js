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
    openningBalance: [
        {
            _id: false,
            year: { type: String },
            amount: { type: Number },
        }
    ],
    isActive:{
        type: Boolean,
        default: true
    },
    plan:{
        type: String,
        default:"BAS"
    },
    storeBookings:{
        type: Boolean,
        default:false
    },
    tcLink:{
        type: String,
    },
    daysClosed:[{
        type: Date
    }]
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Store = mongoose.model('Store', storeSchema);