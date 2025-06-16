import mongoose from "mongoose";

const favoriteDescriptionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
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

export const FavoriteDescription = mongoose.model('FavoriteDescription', favoriteDescriptionSchema);