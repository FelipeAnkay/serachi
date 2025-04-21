import express from 'express';
import {updateStore, createStore,updateService, createService, login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, createProduct, createRoom, updateRoom, createBook, updateBook } from '../controllers/auth.controller.js';
import {verifyToken} from '../middleware/verifyToken.js';

const router = express.Router();

/* USER ROUTES */
router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

/* SERVICE ROUTES */
router.post("/create-service", createService);

router.post("/update-service", updateService);

/* PRODUCT ROUTES */
router.post("/create-product", createProduct);

/* STORE ROUTES */
router.post("/create-store", createStore);

router.post("/update-store", updateStore);

/* ROOM ROUTES */
router.post("/create-room", createRoom);

router.post("/update-room", updateRoom);

/* BOOK ROUTES */
router.post("/create-book", createBook);

router.post("/update-book", updateBook);

export default router;