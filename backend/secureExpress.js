// secureExpress.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import path from 'path';
import { connectDB } from './db/connectdb.js';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import customerRoutes from './routes/customer.route.js';
import serviceRoutes from './routes/service.route.js';
import staffRoutes from './routes/staff.route.js';
import quoteRoutes from './routes/quote.route.js';
import roomRoutes from './routes/room.route.js';
import roomReservationRoutes from './routes/roomReservation.route.js';
import experienceRoutes from './routes/experience.route.js';
import partnerRoutes from './routes/partner.route.js';
import incomeRoutes from './routes/income.route.js';
import expenseRoutes from './routes/expense.route.js';
import payrateRoutes from './routes/payrate.route.js';
import typeRoutes from './routes/type.route.js';
import prrecordRoutes from './routes/prrecord.route.js';
import storeRoutes from './routes/store.route.js'
import supplierRoutes from './routes/supplier.route.js'

dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

// === 1. Seguridad general ===
app.use(helmet()); // protege headers
app.use(mongoSanitize()); // evita NoSQL injection
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// === 2. Rate limit para rutas sensibles ===
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 requests por IP
  message: "Too many requests, please try again later.",
});


// === 3. Rutas ===
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reservations", roomReservationRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payrates", payrateRoutes);
app.use("/api/types", typeRoutes);
app.use("/api/prrecords", prrecordRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/suppliers", supplierRoutes);

// === 4. Servir frontend en producción ===
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// === 5. Error handler seguro ===
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// === 6. Start server ===
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running securely on port ${PORT}`);
});