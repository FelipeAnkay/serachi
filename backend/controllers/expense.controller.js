import { Expense } from '../models/expense.model.js'
/*Quote FUNCTIONS */
export const createExpense = async (req, res) => {
    const { date, description, supplierId, currency, amount, tag, userEmail, paymentMethod,storeId } = req.body;
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
            currency, 
            amount, 
            tag, 
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