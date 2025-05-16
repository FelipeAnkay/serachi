import mongoose from "mongoose";
const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    code: {
        type: String,
        required: false
    }
}, { _id: false });

const prrecordSchema = new mongoose.Schema({
    dateInit: {
        type: Date,
        required: true
    },
    dateEnd: {
        type: Date,
        required: true
    },
    recordDetail: [
        {
            _id: false,
            staffEmail: { type: String },
            serviceId: [{ type: String }],
            amount: { type: Number },
        }
    ],
    tag: [tagSchema],
    type: {
        type: String,
    },
    userEmail: {
        type: String,
        required: true
    },
    storeId: {
        type: String,
        required: true
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const PRrecord = mongoose.model('PRrecord', prrecordSchema);