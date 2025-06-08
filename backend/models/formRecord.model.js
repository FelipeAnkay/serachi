import mongoose from "mongoose";
const formRecordSchema = new mongoose.Schema({
    customerEmail: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    },
    formName: {
        type: String,
        required: true
    },
    formTxt: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    answers: mongoose.Schema.Types.Mixed,

    signature: {
        type: String
    },
    signatureGuardian: {
        type: String
    },
    signedAt: {
        type: Date
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const FormRecord = mongoose.model('FormRecord', formRecordSchema);