import express from 'express';
import { createCustomer, updateCustomer, customerList, customerByEmail, createIndex } from '../controllers/customer.controller.js';

const router = express.Router();

router.post("/create", createCustomer);
router.post("/update", updateCustomer);
router.get("/list/:storeId", customerList);
router.get("/get/:email/:storeId", customerByEmail);
router.post("/syncIndex", createIndex);

export default router;