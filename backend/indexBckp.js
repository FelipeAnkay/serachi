import express from 'express';
import { connectDB } from './db/connectdb.js';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from "./routes/auth.route.js";
import cookieParser from 'cookie-parser';
import path from "path";
import rateLimit from 'express-rate-limit';


dotenv.config();
//this is for prod
//const serverless = require("serverless-http");

const app = express();
// HABILITAR PARA DEV ENV
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({origin: process.env.CLIENT_URL, credentials:true}));
    
app.use(express.json());  //Allows us to parse incoming request with JSON
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // máximo 20 peticiones por IP
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontend/dist")));
    app.get("*", (req,res) => {
        res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"));
    })
}

/* HABILITAR PARA DEV ENV */
app.listen(PORT, () =>{
    connectDB();
    console.log("Server is running on: ", PORT);
});


//this is for prod
//module.exports.handler = serverless(app);
