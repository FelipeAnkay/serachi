import express from 'express';
import {login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, updateUser } from '../controllers/auth.controller.js';
import {createBook, updateBook } from '../controllers/book.controller.js';
import {createCustomer, updateCustomer, customerList, customerByEmail } from '../controllers/customer.controller.js';
import {createExperience, updateExperience, experienceList} from '../controllers/experience.controller.js';
import {createFacility, updateFacility} from '../controllers/facility.controller.js';
import {createPartner, updatePartner, partnerList, partnerByEmail, removePartner } from '../controllers/partner.controller.js';
import {createProduct, getProductById, updateProduct, productList, removeProduct, getProductByType } from '../controllers/product.controller.js';
import {createQuote, updateQuote, quoteList, getQuoteById, openQuoteList, confirmQuoteList, getQuoteByEmail } from '../controllers/quote.controller.js';
import {createRoom, getRoomById, roomList, updateRoom } from '../controllers/room.controller.js';
import {createRoomReservation, getAvailableRooms, roomReservationList, splitRoomReservation, updateRoomReservation } from '../controllers/roomReservation.controller.js';
import {updateService, createService, getServiceById, getServiceNoStaff, getServiceByStoreId, getServiceNoData, getServiceByDates } from '../controllers/service.controller.js';
import {createStaff, updateStaff, staffList, staffByEmail, removeStaff, staffListByType } from '../controllers/staff.controller.js';
import {updateStore, createStore, getStoreById, usersCompany } from '../controllers/store.controller.js';
import {verifyToken} from '../middleware/verifyToken.js';
import { createIncome, getIncomeById, incomeList, updateIncome } from '../controllers/income.controller.js';
import { createExpense, expenseList, getExpenseById, updateExpense } from '../controllers/expense.controller.js';
import { createSupplier, supplierList, updateSupplier } from '../controllers/supplier.controller.js';
import { createPayRate, getPayRateByEmail, getPayRateById, payrateList, removePayrate, updatePayRate } from '../controllers/payrate.controller.js';
import { createType, getTypeByCategory, typeList, updateType } from '../controllers/type.controller.js';
import { createPRrecord, getPRrecordById, prrecordList, updatePRrecord } from '../controllers/prrecord.controller.js';

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

router.post("/update-user", updateUser);

/* SERVICE ROUTES */
router.post("/create-service", createService);
router.post("/update-service", updateService);
router.get("/get-service-id/:id", getServiceById);
router.get("/get-service-store/:storeId", getServiceByStoreId);
router.get("/get-service-nostaff/:storeId", getServiceNoStaff);
router.get("/get-service-nodata/:storeId", getServiceNoData);
router.get("/get-service-dates/:storeId/:dateIn/:dateOut", getServiceByDates);

/* PRODUCT ROUTES */
router.post("/create-product", createProduct);
router.get("/get-product-id/:id", getProductById);
router.post("/update-product", updateProduct);
router.get("/get-product-store/:storeId", productList);
router.post("/remove-product", removeProduct);
router.get("/get-product-type/:type/:storeId", getProductByType);

/* STORE ROUTES */
router.post("/create-store", createStore);

router.post("/update-store", updateStore);

router.get("/get-store-id/:id", getStoreById);

/* ROOM ROUTES */
router.post("/create-room", createRoom);

router.post("/update-room", updateRoom);

router.get("/get-room-store/:storeId", roomList);
router.get("/get-room-id/:id", getRoomById);

/* ROOM Reservation ROUTES */
router.post("/create-room-reservation", createRoomReservation);

router.post("/update-room-reservation", updateRoomReservation);

router.get("/get-room-reservation-store/:storeId", roomReservationList);

router.post("/get-available-rooms", getAvailableRooms);

router.post("/split-room-reservation",splitRoomReservation)

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
router.post("/create-supplier", createSupplier);

router.post("/update-supplier", updateSupplier);

router.get("/get-supplier-store/:storeId", supplierList);

/* Staff ROUTES */
router.post("/create-staff", createStaff);

router.post("/update-staff", updateStaff);

router.post("/remove-staff", removeStaff);

router.get("/get-staff/:storeId", staffList);

router.get("/get-staff-email/:email", staffByEmail);

router.get("/get-staff-type/:type/:storeId", staffListByType);

/* Quote ROUTES */
router.post("/create-quote", createQuote);
router.post("/update-quote", updateQuote);
router.get("/get-quote-store/:storeId", quoteList);
router.get("/get-quote-open/:storeId", openQuoteList);
router.get("/get-quote-confirm/:storeId", confirmQuoteList);
router.get("/get-quote-id/:id", getQuoteById);
router.get("/get-quote-email/:email", getQuoteByEmail);

/* Partner ROUTES */
router.post("/create-partner", createPartner);

router.post("/update-partner", updatePartner);

router.post("/remove-partner", removePartner);

router.get("/get-partner-store/:storeId", partnerList);

router.get("/get-partner-email/:email", partnerByEmail);

/* Income ROUTES */
router.post("/create-income", createIncome);
router.post("/update-income", updateIncome);
router.get("/get-income-store/:storeId", incomeList);
router.get("/get-income-id/:id", getIncomeById);

/* Expense ROUTES */
router.post("/create-expense", createExpense);
router.post("/update-expense", updateExpense);
router.get("/get-expense-store/:storeId", expenseList);
router.get("/get-expense-id/:id", getExpenseById);

/* Payrate ROUTES */
router.post("/create-payrate", createPayRate);

router.post("/update-payrate", updatePayRate);

router.post("/remove-payrate", removePayrate);

router.get("/get-payrate-store/:storeId", payrateList);

router.get("/get-payrate-email/:email/:storeId", getPayRateByEmail);

router.get("/get-payrate-id/:id", getPayRateById);

/* type ROUTES */
router.post("/create-type", createType);

router.post("/update-type", updateType);

router.get("/get-type-store/:storeId", typeList);
router.get("/get-type-category/:category/:storeId", getTypeByCategory);

/* PRrecord ROUTES */
router.post("/create-prrecord", createPRrecord);
router.post("/update-prrcord", updatePRrecord);
router.get("/get-prrecord-store/:storeId", prrecordList);
router.get("/get-prrecord-email/:id", getPRrecordById);

export default router;