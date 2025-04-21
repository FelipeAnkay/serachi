import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
        productId: String,
        date: String,
        timeFrame: String,
  }, { _id: false }); 
const experienceSchema = new mongoose.Schema({
    serviceId: {
        type:String,
        required: true
    },
    bookId: {
        type:String,
        required: true
    },
    storeId: {
        type:String,
        required: true
    },
    userId: {
        type:String,
        required: true
    },
    dateIn: {
        type:Date
    },
    dateOut: {
        type:Date
    },
    workFrame: [[itemSchema]],
    assignedStaff:{
        type:String
    },
},{timestamps : true}); //fields created and updated AT by default with timestamp true

export const Experience = mongoose.model('Experience', experienceSchema);