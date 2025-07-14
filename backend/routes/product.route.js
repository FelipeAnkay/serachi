import express from 'express';
import { createProduct, getProductById, updateProduct, productList, removeProduct, getProductByType, getProductByIds, getProductForDisplay, deleteAllProductByUEmail } from '../controllers/product.controller.js';

const router = express.Router();

router.post("/create", createProduct);
router.get("/get/:id", getProductById);
router.get("/get-ids/:ids", getProductByIds);
router.post("/update", updateProduct);
router.get("/list/:storeId", productList);
router.post("/remove", removeProduct);
router.get("/type/:type/:storeId", getProductByType);
router.get("/display/:storeId", getProductForDisplay);
router.delete("/delete-all/:userEmail/:storeId", deleteAllProductByUEmail)
export default router;
