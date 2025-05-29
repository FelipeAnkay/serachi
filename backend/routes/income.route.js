import express from 'express';
import { createIncome, getIncomeByDates, getIncomeById, incomeList, updateIncome } from '../controllers/income.controller.js';

const router = express.Router();

router.post("/create", createIncome);
router.post("/update", updateIncome);
router.get("/list/:storeId", incomeList);
router.get("/get/:id", getIncomeById);
router.get("/dates/:dateStart/:dateEnd/:storeId", getIncomeByDates);

export default router;