import { sendQuoteEmail } from "../mailtrap/emails.js";
import { Store } from "../models/store.model.js"
import { Quote } from "../models/quote.model.js";

/*Quote FUNCTIONS */
export const createQuote = async (req, res) => {
    const { dateIn, dateOut, customerEmail, customerName, storeId, roomList, partnerId, productList, discount, finalPrice, taxes, grossPrice, currency, isConfirmed, isReturningCustomer, userEmail, userName, tag, source, customSource, sendEmail } = req.body;
    //console.log("B: createQuote data: ", dateIn ," - ", dateOut," - ",customerEmail," - ",customerName," - ",storeId," - ",roomId," - ",partnerId," - ",productList," - ",discount," - ",finalPrice," - ",currency," - ",isConfirmed," - ",isReturningCustomer," - ",userEmail," - ",userName," - "," - ",tag)
    try {
        if (!dateIn || !dateOut || !customerEmail || ((!Array.isArray(productList) || productList.length === 0) && (!Array.isArray(roomList) || roomList.length === 0)) || !finalPrice || !storeId || !userEmail || !customerName || !userName) {
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
    const { id, sendEmail, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const quote = await Quote.findByIdAndUpdate(id, updateFields, {
            new: true
        });
        console.log("sendEmail: ", {sendEmail})
        const shouldSendEmail = sendEmail === true || sendEmail === 'true';
        console.log("shouldSendEmail: ", {shouldSendEmail})
        if (shouldSendEmail) {
            
            const { customerEmail, customerName, dateIn, dateOut, productList, roomList, discount, finalPrice, userEmail, userName, storeId } = req.body;
            const normalizedStoreId = storeId?.toUpperCase();
            const store = await Store.findOne({ storeId: normalizedStoreId })
            console.log("B: Los datos para el envío de mail son: ", customerEmail," - ",customerName," - ",dateIn," - ",dateOut," - ",productList," - ",discount," - ",finalPrice," - ",userEmail," - ", userName," - ",store.name," - ",store.tcLink," - ",store.plan);
            await sendQuoteEmail(customerEmail, customerName, dateIn, dateOut, productList, roomList, discount, finalPrice, userEmail, userName, store.name, store.tcLink, store.plan);
        }

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
            dateOut: { $gte: startOfToday },
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

export const getMonthCreatedQuotes = async (req, res) => {
    try {
        const { storeId } = req.params;
        const normalizeStoreID = storeId?.toUpperCase();

        const startOfToday = new Date();
        startOfToday.setHours(23, 59, 59, 999);

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 31);
        monthAgo.setHours(0, 0, 0, 0);

        const quoteList = await Quote.find({
            storeId: normalizeStoreID,
            createdAt: { $gte: monthAgo, $lte: startOfToday },
        });

        if (quoteList.length === 0) {
            return res.status(200).json({ success: false, message: "No quotes found" });
        }

        res.status(200).json({ success: true, quoteList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getMonthConfirmedQuotes = async (req, res) => {
    try {
        const { storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        // Definir rango de fechas: desde hace 31 días hasta hoy
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 31);
        monthAgo.setHours(0, 0, 0, 0);

        // Buscar cotizaciones confirmadas en ese rango de fechas
        const quoteList = await Quote.find({
            storeId: normalizedStoreId,
            isConfirmed: true,
            updatedAt: { $gte: monthAgo, $lte: endOfToday },
            status: { $ne: "archived" }
        });

        if (quoteList.length === 0) {
            return res.status(200).json({ success: false, message: "No confirmed quotes found in this range" });
        }

        res.status(200).json({ success: true, quoteList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const getAnnualClosingRate = async (req, res) => {
    try {
        const { storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        const startOfYear = new Date(new Date().getFullYear(), 0, 1); // 1 de enero 00:00
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // hasta hoy

        // Total de quotes creadas este año
        const totalQuotes = await Quote.countDocuments({
            storeId: normalizedStoreId,
            createdAt: { $gte: startOfYear, $lte: endOfToday },
        });

        // Quotes confirmadas este año
        const confirmedQuotes = await Quote.countDocuments({
            storeId: normalizedStoreId,
            isConfirmed: true,
            createdAt: { $gte: startOfYear, $lte: endOfToday },
        });

        const closingRate = totalQuotes > 0 ? confirmedQuotes / totalQuotes : 0;

        return res.status(200).json({
            success: true,
            closingRate: closingRate.toFixed(4), // por ejemplo: 0.3548
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteAllQuoteByUEmail = async (req, res) => {
    try {
        const { userEmail, storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        // Construimos el filtro de búsqueda
        const filter = { userEmail: userEmail, storeId: normalizedStoreId };

        const result = await Quote.deleteMany(filter);

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} Quote deleted`,
        });
    } catch (error) {
        return res
            .status(400)
            .json({ success: false, message: error.message });
    }
};