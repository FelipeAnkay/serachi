import mongoose from "mongoose";
const roleSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    storeId:{
        type:String,
        required: true,
    },
    description:{
        type:String,
    },
    permission: [{
        type:String,
    }],
    userEmail:{
        type:String, //Who create the role
    }
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Role = mongoose.model('Role', roleSchema);