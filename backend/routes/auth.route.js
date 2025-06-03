import express from 'express';
import {login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, updateUser, getUsersByEmails, getUserByEmail } from '../controllers/auth.controller.js';

import {usersCompany } from '../controllers/store.controller.js';
import {verifyToken} from '../middleware/verifyToken.js';


const router = express.Router();

/* USER ROUTES */
router.get("/check-auth", verifyToken, checkAuth);

router.get("/users-company/:storeId", usersCompany);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/update-user", updateUser);

router.get("/get-emails/:emails/:storeId", getUsersByEmails);
router.get("/get/:email", getUserByEmail);

export default router;