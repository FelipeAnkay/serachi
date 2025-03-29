import express from 'express';
import { connectDB } from './db/connectdb.js';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from "./routes/auth.route.js";
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req,res) =>{
    res.send("Hello W123");
});
app.use(cors({origin: process.env.CLIENT_URL, credentials:true}));
app.use(express.json());  //Allows us to parse incoming request with JSON
app.use(cookieParser());

app.use("/api/auth", authRoutes);


app.listen(PORT, () =>{
    connectDB();
    console.log("Server is running on: ", PORT);
});

