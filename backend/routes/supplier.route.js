import express from 'express';
import { createSupplier, supplierList, updateSupplier, supplierByEmail, createIndex, removeSupplier } from '../controllers/supplier.controller.js';

const router = express.Router();

router.post("/create", createSupplier);

router.post("/update", updateSupplier);

router.get("/list/:storeId", supplierList);

router.get("/get/:email/:storeId", supplierByEmail);

router.post("/remove", removeSupplier);

router.post("/syncIndex", createIndex);

export default router;