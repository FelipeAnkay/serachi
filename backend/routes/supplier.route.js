import express from 'express';
import { createSupplier, supplierList, updateSupplier, supplierByEmail } from '../controllers/supplier.controller.js';

const router = express.Router();

router.post("/create", createSupplier);

router.post("/update", updateSupplier);

router.get("/list/:storeId", supplierList);

router.get("/get/:email", supplierByEmail);

export default router;