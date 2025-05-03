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
    emergencyContact:{
        _id: false,
        emergencyContactName:{
            type: String
        },
        emergencyContactPhone:{
            type: String
        }
    },
    professionalCertificates: [[divingCertificateSchema]],
    storeId: {
        type:String,
        required: true
    }

},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Customer = mongoose.model('Customer', customerSchema);