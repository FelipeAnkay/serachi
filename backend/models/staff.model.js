import mongoose from "mongoose";
const profesionalSchema = new mongoose.Schema({
    organization: {
        type:String
    },
    certificateName: {
        type:String
    },
    certificateId: {
        type:String
    }
}, { _id: false }); 

const staffSchema = new mongoose.Schema({
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
    birthdate: {
        type:Date,
    },
    nationalId: {
        type:String,
    },
    languages:{
        type:[String],
        required: true,
    },
    type:{
        type: String,
    },
    color:{
        type:String,
    },
    professionalCertificates: [profesionalSchema],
    storeId: {
        type:String,
        required: true
    }

},{timestamps : true}); //fields created and updated AT by default with timestamp true

staffSchema.index({ email: 1, storeId: 1 }, { unique: true });

export const Staff = mongoose.model('Staff', staffSchema);