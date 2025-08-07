import { Expense } from '../models/expense.model.js'
/*Quote FUNCTIONS */
export const createExpense = async (req, res) => {
    const { date, description, supplierId, staffEmail, currency, amount, tag, type, userEmail, paymentMethod, storeId } = req.body;
    //console.log("B: createQuote data: ", dateIn ," - ", dateOut," - ",customerEmail," - ",customerName," - ",storeId," - ",roomId," - ",partnerId," - ",discount," - ",finalPrice," - ",currency," - ",isConfirmed," - ",isReturningCustomer," - ",userEmail," - ",userName," - "," - ",tag)
    try {
        if (!date || !amount || !storeId || !userEmail || !paymentMethod) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const expense = new Expense({
            date,
            description,
            supplierId,
            staffEmail,
            currency,
            amount,
            tag,
            type,
            userEmail,
            paymentMethod,
            storeId: normalizedStoreId
        });

        await expense.save();

        res.status(201).json({
            success: true,
            message: "expense created succesfully",
            service: {
                ...expense._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateExpense = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const expense = await Expense.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "expense updated succesfully",
            service: {
                ...expense._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const expenseList = async (req, res) => {
    try {
        const { storeId } = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const expenseList = await Expense.find({ storeId: normalizeStoreID });
        //console.log("El listado de expense es:", expenseList);
        if (!expenseList) {
            return res.status(400).json({ success: false, message: "expense not found" });
        }
        res.status(200).json({ success: true, expenseList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(400).json({ success: false, message: "expense not found" });
        }
        res.status(200).json({ success: true, expense });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getExpenseByDates = async (req, res) => {
    try {
        const { dateStart, dateEnd, storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        // Crear fecha de inicio: 00:00:00.000
        const startDate = new Date(dateStart);
        startDate.setUTCHours(0, 0, 0, 0);

        // Crear fecha de término: 23:59:59.999
        const endDate = new Date(dateEnd);
        endDate.setUTCHours(23, 59, 59, 999);

        const expenseList = await Expense.find({
            storeId: normalizedStoreId,
            date: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        if (!expenseList) {
            return res.status(400).json({ success: false, message: "expense not found" });
        }
        res.status(200).json({ success: true, expenseList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteAllExpenseByUEmail = async (req, res) => {
    try {
        const { userEmail, storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        // Construimos el filtro de búsqueda
        const filter = { userEmail: userEmail, storeId: normalizedStoreId };

        const result = await Expense.deleteMany(filter);

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} Expense deleted`,
        });
    } catch (error) {
        return res
            .status(400)
            .json({ success: false, message: error.message });
    }
};