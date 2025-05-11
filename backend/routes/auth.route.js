import express from 'express';
import {updateStore, createStore,updateService, createService, login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, createProduct, createRoom, updateRoom, createBook, updateBook, createExperience, updateExperience, usersCompany, experienceList, createCustomer, updateCustomer, customerList, createStaff, updateStaff, staffList, getServiceById, getProductById, createFacility, updateFacility, getServiceNoStaff, staffByEmail, removeStaff, updateProduct, productList, removeProduct, createQuote, updateQuote, customerByEmail, createPartner, updatePartner, partnerList, partnerByEmail, removePartner, quoteList, getQuoteById, getStoreById, openQuoteList, confirmQuoteList, getServiceByStoreId, getServiceNoData } from '../controllers/auth.controller.js';
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

router.get("/get-service-id/:id", getServiceById);
router.get("/get-service-store/:storeId", getServiceByStoreId);
router.get("/get-service-nostaff/:storeId", getServiceNoStaff);
router.get("/get-service-nodata/:storeId", getServiceNoData);

/* PRODUCT ROUTES */
router.post("/create-product", createProduct);
router.get("/get-product-id/:id", getProductById);
router.post("/update-product", updateProduct);
router.get("/get-product-store/:storeId", productList);
router.post("/remove-product", removeProduct);

/* STORE ROUTES */
router.post("/create-store", createStore);

router.post("/update-store", updateStore);

router.get("/get-store-id/:id", getStoreById);

/* ROOM ROUTES */
router.post("/create-room", createRoom);

router.post("/update-room", updateRoom);

/* FACILITY ROUTES */
router.post("/create-facility", createFacility);

router.post("/update-facility", updateFacility);

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

router.get("/get-customer-store/:storeId", customerList);
router.get("/get-customer-email/:email", customerByEmail);

/* SUPPLIER ROUTES */
router.post("/create-supplier", createCustomer);

router.post("/update-supplier", updateCustomer);

router.get("/get-supplier", customerList);

/* Staff ROUTES */
router.post("/create-staff", createStaff);

router.post("/update-staff", updateStaff);

router.post("/remove-staff", removeStaff);

router.get("/get-staff/:storeId", staffList);

router.get("/get-staff-email/:email", staffByEmail);

/* Quote ROUTES */
router.post("/create-quote", createQuote);

router.post("/update-quote", updateQuote);

router.get("/get-quote-store/:storeId", quoteList);
router.get("/get-quote-open/:storeId", openQuoteList);
router.get("/get-quote-confirm/:storeId", confirmQuoteList);
router.get("/get-quote-id/:id", getQuoteById);

/* Partner ROUTES */
router.post("/create-partner", createPartner);

router.post("/update-partner", updatePartner);

router.post("/remove-partner", removePartner);

router.get("/get-partner-store/:storeId", partnerList);

router.get("/get-partner-email/:email", partnerByEmail);

export default router;