import express from 'express';
import { createQuote, updateQuote, quoteList, getQuoteById, openQuoteList, confirmQuoteList, getQuoteByEmail, getQuoteByCheckout } from '../controllers/quote.controller.js';

const router = express.Router();

router.post("/create", createQuote);
router.post("/update", updateQuote);
router.get("/list/:storeId", quoteList);
router.get("/open/:storeId", openQuoteList);
router.get("/confirm/:storeId", confirmQuoteList);
router.get("/get/:id", getQuoteById);
router.get("/email/:email/:storeId", getQuoteByEmail);
router.get("/checkout/:storeId/:isConfirmed", getQuoteByCheckout);

export default router;