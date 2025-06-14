import { Income } from '../models/income.model.js'
/*Quote FUNCTIONS */
export const createIncome = async (req, res) => {
    const { date, customerEmail, partnerId, quoteId, productList, currency, amount, tag, userEmail, paymentMethod, storeId } = req.body;
    //console.log("B: createQuote data: ", dateIn ," - ", dateOut," - ",customerEmail," - ",customerName," - ",storeId," - ",roomId," - ",partnerId," - ",productList," - ",discount," - ",finalPrice," - ",currency," - ",isConfirmed," - ",isReturningCustomer," - ",userEmail," - ",userName," - "," - ",tag)
    try {
        if (!date || !amount || !storeId || !userEmail || !paymentMethod) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const income = new Income({
            date,
            customerEmail,
            partnerId,
            quoteId,
            productList,
            currency,
            amount,
            tag,
            userEmail,
            paymentMethod,
            storeId: normalizedStoreId
        });

        await income.save();

        res.status(201).json({
            success: true,
            message: "income created succesfully",
            service: {
                ...income._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateIncome = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const income = await Income.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "income updated succesfully",
            service: {
                ...income._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const incomeList = async (req, res) => {
    try {
        const { storeId } = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const incomeList = await Income.find({ storeId: normalizeStoreID });
        //console.log("El listado de income es:", incomeList);
        if (!incomeList) {
            return res.status(400).json({ success: false, message: "income not found" });
        }
        res.status(200).json({ success: true, incomeList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}


export const getIncomeById = async (req, res) => {
    try {
        const { id } = req.params;
        const income = await Income.findById(id);
        if (!income) {
            return res.status(400).json({ success: false, message: "income not found" });
        }
        res.status(200).json({ success: true, income });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getIncomeByDates = async (req, res) => {
    try {
        const { dateStart, dateEnd, storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();
        //console.log("getIncomeByDates data: ", { dateStart, dateEnd, normalizedStoreId })
        const incomeList = await Income.find({
            storeId: normalizedStoreId,
            date: {
                $gte: new Date(dateStart),
                $lte: new Date(dateEnd)
            },
        });

        //console.log("IncomeList: ", incomeList)
        if (!incomeList) {
            return res.status(400).json({ success: false, message: "incomeList not found" });
        }
        res.status(200).json({ success: true, incomeList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}