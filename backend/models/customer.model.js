import mongoose from "mongoose";
const divingCertificateSchema = new mongoose.Schema({
    organization: {
        type:String,
        required: false
    },
    certificateName: {
        type:String,
        required: false
    },
    certificateId: {
        type:String
    }
}, { _id: false }); 
const customerSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    name: {
        type:String,
        required: true
    },
    lastName: {
        type:String,
    },
    phone: {
        type:String,
    },
    country: {
        type:String,
    },
    languages:{type:[String]},
    birthdate: {
        type:Date,
    },
    nationalId: {
        type:String,
    },
    diet: {
        type:String,
    },
    allergies: {
        type:String,
    },
    emergencyContact:{
        _id: false,
        emergencyContactName:{
            type: String
        },
        emergencyContactPhone:{
            type: String
        }
    },
    divingCertificates: [divingCertificateSchema],
    storeId: {
        type:String,
        required: true
    }

},{timestamps : true}); //fields created and updated AT by default with timestamp true

customerSchema.index({ email: 1, storeId: 1 }, { unique: true });

export const Customer = mongoose.model('Customer', customerSchema);