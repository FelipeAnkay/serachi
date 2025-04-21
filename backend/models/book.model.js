import mongoose from "mongoose";
const bookSchema = new mongoose.Schema({
    dateIn: {
        type:Date,
        required: true
    },
    dateOut: {
        type:Date,
        required: true
    },
    roomId: {
        type:String,
        required: true
    },
    storeId: {
        type:String,
        required: true
    },
    clientName: {
        type:String,
        required: true
    },
    clientEmail: {
        type:String,
        required: true
    },
    clientQty: {
        type:Number,
        default: 1
    },
    userId:{
        type:String,
        required: true
    },
    isActive:{
        type: Boolean,
        default: true
    },
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Book = mongoose.model('Book', bookSchema);