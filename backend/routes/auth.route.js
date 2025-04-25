import express from 'express';
import {updateStore, createStore,updateService, createService, login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, createProduct, createRoom, updateRoom, createBook, updateBook, createExperience, updateExperience, usersCompany, experienceList, createCustomer, updateCustomer, customerList, createStaff, updateStaff, staffList } from '../controllers/auth.controller.js';
import {verifyToken} from '../middleware/verifyToken.js';

const router = express.Router();

/* USER ROUTES */
router.get("/check-auth", verifyToken, checkAuth);

router.get("/users-company", usersCompany);

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

/* EXPERIENCE ROUTES */
router.post("/create-experience", createExperience);

router.post("/update-experience", updateExperience);

router.get("/get-experience", experienceList);

/* Customer ROUTES */
router.post("/create-customer", createCustomer);

router.post("/update-customer", updateCustomer);

router.get("/get-customer", customerList);

/* Staff ROUTES */
router.post("/create-staff", createStaff);

router.post("/update-staff", updateStaff);

router.get("/get-staff", staffList);



export default router;