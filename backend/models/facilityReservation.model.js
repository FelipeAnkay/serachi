import mongoose from "mongoose";
const facilityReservationSchema = new mongoose.Schema({
    facilityId: {
        type: String,
        required: true
    },
    serviceId: {
        type: String,
    },
    customerEmail: {
        type: String,
    },
    staffEmail: {
        type: String,
    },
    storeId: {
        type: String,
        required: true,
    },
    dateIn: {
        type: Date,
        required: true,
    },
    dateOut: {
        type: Date,
        required: true,
    },
    spaceReserved: {
        type: Number,
        default: 1
    },
    userEmail: {
        type: String,
        required: true
    }
}, { timestamps: true }); //fields created and updated AT by default with timestamp true

export const FacilityReservation = mongoose.model('FacilityReservation', facilityReservationSchema);