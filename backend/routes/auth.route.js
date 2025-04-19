import express from 'express';
import { createService, login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, createActivity } from '../controllers/auth.controller.js';
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

/* activity ROUTES */
router.post("/create-activity", createActivity);

export default router;