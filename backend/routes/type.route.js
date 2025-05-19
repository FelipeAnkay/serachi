import express from 'express';
import { createType, getTypeByCategory, typeList, updateType } from '../controllers/type.controller.js';

const router = express.Router();

router.post("/create", createType);
router.post("/update", updateType);
router.get("/list/:storeId", typeList);
router.get("/category/:category/:storeId", getTypeByCategory);

export default router;