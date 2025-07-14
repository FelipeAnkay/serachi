import express from 'express';
import { createCustomer, updateCustomer, customerList, customerByEmail, createIndex, createCustomerMasiveBatch, postProfileEmail, getCustomerByEmails, deleteAllCustomerByUEmail } from '../controllers/customer.controller.js';

const router = express.Router();

router.post("/create", createCustomer);
router.post("/update", updateCustomer);
router.get("/list/:storeId", customerList);
router.get("/get/:email/:storeId", customerByEmail);
router.post("/syncIndex", createIndex);
router.post("/batch", createCustomerMasiveBatch);
router.post("/send-profile", postProfileEmail);
router.get("/list-emails/:emails/:storeId", getCustomerByEmails);
router.delete("/delete-all/:userEmail/:storeId", deleteAllCustomerByUEmail)

export default router;