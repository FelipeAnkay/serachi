import express from 'express';
import { createProduct, getProductById, updateProduct, productList, removeProduct, getProductByType } from '../controllers/product.controller.js';

const router = express.Router();

router.post("/create", createProduct);
router.get("/get/:id", getProductById);
router.post("/update", updateProduct);
router.get("/list/:storeId", productList);
router.post("/remove", removeProduct);
router.get("/type/:type/:storeId", getProductByType);

export default router;
