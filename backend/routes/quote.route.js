import express from 'express';
import { createQuote, updateQuote, quoteList, getQuoteById, openQuoteList, confirmQuoteList, getQuoteByEmail, getQuoteByCheckout, deleteAllQuoteByUEmail, getMonthCreatedQuotes, getMonthConfirmedQuotes, getAnnualClosingRate } from '../controllers/quote.controller.js';

const router = express.Router();

router.post("/create", createQuote);
router.post("/update", updateQuote);
router.get("/list/:storeId", quoteList);
router.get("/open/:storeId", openQuoteList);
router.get("/confirm/:storeId", confirmQuoteList);
router.get("/get/:id", getQuoteById);
router.get("/email/:email/:storeId", getQuoteByEmail);
router.get("/checkout/:storeId/:isConfirmed", getQuoteByCheckout);
router.delete("/delete-all/:userEmail/:storeId", deleteAllQuoteByUEmail);
router.get("/month/:storeId", getMonthCreatedQuotes);
router.get("/month-confirmed/:storeId", getMonthConfirmedQuotes);
router.get("/annual-rate/:storeId", getAnnualClosingRate);

export default router;