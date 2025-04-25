import mongoose from "mongoose";
const profesionalSchema = new mongoose.Schema({
    organization: {
        type:String,
        required: true
    },
    certificateName: {
        type:String,
        required: true
    },
    certificateId: {
        type:String
    }
}, { _id: false }); 

const staffSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique: true
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
    birthdate: {
        type:Date,
    },
    nationalId: {
        type:String,
    },
    professionalCertificates: [[profesionalSchema]],
    storeId: [{
        type:String,
        required: true
    }]

},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Staff = mongoose.model('Staff', staffSchema);