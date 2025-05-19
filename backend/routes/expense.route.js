import express from 'express';
import { createExpense, expenseList, getExpenseById, updateExpense } from '../controllers/expense.controller.js';

const router = express.Router();

router.post("/create", createExpense);
router.post("/update", updateExpense);
router.get("/list/:storeId", expenseList);
router.get("/get/:id", getExpenseById);

export default router;