import mongoose from "mongoose";
const supplierSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    name: {
        type:String,
        required: true
    },
    phone: {
        type:String,
    },
    country: {
        type:String,
    },
    nationalId: {
        type:String,
    },
    storeId: {
        type:String,
        required: true
    }

},{timestamps : true}); //fields created and updated AT by default with timestamp true

supplierSchema.index({ email: 1, storeId: 1 }, { unique: true });

export const Supplier = mongoose.model('Supplier', supplierSchema);