import { sendQuoteEmail } from "../mailtrap/emails.js";
import { Store } from "../models/store.model.js"
import { Quote } from "../models/quote.model.js";

/*Quote FUNCTIONS */
export const createQuote = async (req, res) => {
    const { dateIn, dateOut, customerEmail, customerName, storeId, roomList, partnerId, productList, discount, finalPrice, taxes, grossPrice, currency, isConfirmed, isReturningCustomer, userEmail, userName, tag, source, customSource, sendEmail } = req.body;
    //console.log("B: createQuote data: ", dateIn ," - ", dateOut," - ",customerEmail," - ",customerName," - ",storeId," - ",roomId," - ",partnerId," - ",productList," - ",discount," - ",finalPrice," - ",currency," - ",isConfirmed," - ",isReturningCustomer," - ",userEmail," - ",userName," - "," - ",tag)
    try {
        if (!dateIn || !dateOut || !customerEmail || !productList || !finalPrice || !storeId || !userEmail || !customerName || !userName) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const quote = new Quote({
            dateIn,
            dateOut,
            customerEmail,
            customerName,
            roomList,
            partnerId,
            productList,
            discount,
            taxes,
            grossPrice,
            finalPrice,
            currency,
            isConfirmed,
            isReturningCustomer,
            userEmail,
            tag,
            source,
            customSource,
            storeId: normalizedStoreId
        });

        await quote.save();

        const store = await Store.findOne({ storeId: normalizedStoreId })

        if (sendEmail) {
            //console.log("B: Los datos para el envío de mail son: ", customerEmail," - ",customerName," - ",dateIn," - ",dateOut," - ",productList," - ",discount," - ",finalPrice," - ",userEmail," - ", userName," - ",store.name);
            await sendQuoteEmail(customerEmail, customerName, dateIn, dateOut, productList, roomList, discount, finalPrice, userEmail, userName, store.name, store.tcLink, store.plan);
        }


        res.status(201).json({
            success: true,
            message: "Quote created succesfully",
            service: {
                ...quote._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateQuote = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const quote = await Quote.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Quote updated succesfully",
            service: {
                ...quote._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const quoteList = async (req, res) => {
    try {
        const { storeId } = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const quoteList = await Quote.find({ storeId: normalizeStoreID });
        //console.log("El listado de quotes es:", quoteList);
        if (!quoteList) {
            return res.status(200).json({ success: false, message: "Quotes not found" });
        }
        res.status(200).json({ success: true, quoteList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const openQuoteList = async (req, res) => {
    try {
        const { storeId } = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const quoteList = await Quote.find({ storeId: normalizeStoreID, isConfirmed: false, status: { $ne: "archived" } });
        //console.log("El listado de quotes es:", quoteList);
        if (!quoteList) {
            return res.status(400).json({ success: false, message: "Quotes not found" });
        }
        res.status(200).json({ success: true, quoteList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const confirmQuoteList = async (req, res) => {
    try {
        const { storeId } = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const quoteList = await Quote.find({ storeId: normalizeStoreID, isConfirmed: true });
        //console.log("El listado de quotes es:", quoteList);
        if (!quoteList) {
            return res.status(400).json({ success: false, message: "Quotes not found" });
        }
        res.status(200).json({ success: true, quoteList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getQuoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(400).json({ success: false, message: "quote not found" });
        }
        res.status(200).json({ success: true, quote });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getQuoteByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params;
        const normalizeStoreID = storeId?.toUpperCase();
        const quote = await Quote.find({ customerEmail: email, storeId: normalizeStoreID });
        if (!quote) {
            return res.status(400).json({ success: false, message: "quote not found" });
        }
        res.status(200).json({ success: true, quote });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getQuoteByCheckout = async (req, res) => {
    try {
        const { storeId, isConfirmed } = req.params;
        const normalizeStoreID = storeId?.toUpperCase();
        //console.log("Entre a getQuoteByCheckout: ", normalizeStoreID, " - ", isConfirmed);

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // 00:00:00.000
        const quoteList = await Quote.find({
            storeId: normalizeStoreID,
            isConfirmed: isConfirmed,
            dateOut: {$gte: startOfToday },
            status: { $ne: "archived" }
        });
        //console.log("quoteList: ", quoteList)
        if (quoteList.length === 0) {
            return res.status(200).json({ success: false, message: "No quotes found" });
        }
        res.status(200).json({ success: true, quoteList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}