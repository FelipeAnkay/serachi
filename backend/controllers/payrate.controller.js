import { PayRate } from '../models/payrate.model.js'
/*Quote FUNCTIONS */
export const createPayRate = async (req, res) => {
    const { staffEmail, productId, feeRules, currency, userEmail, storeId, startDate, finishDate, priority } = req.body;
    //console.log("B: createQuote data: ", dateIn ," - ", dateOut," - ",customerEmail," - ",customerName," - ",storeId," - ",roomId," - ",partnerId," - ",productList," - ",discount," - ",finalPrice," - ",currency," - ",isConfirmed," - ",isReturningCustomer," - ",userEmail," - ",userName," - "," - ",tag)
    try {
        if (!staffEmail || !productId || !storeId || !userEmail || !feeRules) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();
        let auxPriority = priority;
        if(!auxPriority){
            auxPriority = 99;
        }

        const payrate = new PayRate({
            staffEmail, 
            productId, 
            feeRules, 
            currency, 
            userEmail, 
            startDate, 
            finishDate, 
            priority: auxPriority,
            storeId: normalizedStoreId
        });

        await payrate.save();

        res.status(201).json({
            success: true,
            message: "payrate created succesfully",
            service: {
                ...payrate._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updatePayRate = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const payrate = await PayRate.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "payrate updated succesfully",
            service: {
                ...payrate._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const payrateList = async (req, res) => {
    try {
        const { storeId } = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const payrateList = await PayRate.find({ storeId: normalizeStoreID });
        //console.log("El listado de payrate es:", payrateList);
        if (!payrateList) {
            return res.status(400).json({ success: false, message: "payrate not found" });
        }
        res.status(200).json({ success: true, payrateList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getPayRateById = async (req, res) => {
    try {
        const { id } = req.params;
        const payrate = await PayRate.findById(id);
        if (!payrate) {
            return res.status(400).json({ success: false, message: "payrate not found" });
        }
        res.status(200).json({ success: true, payrate });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getPayRateByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params;
        const payrate = await PayRate.find({ staffEmail: email, storeId: storeId.toUpperCase() });
        if (!payrate) {
            return res.status(400).json({ success: false, message: "payrate not found" });
        }
        res.status(200).json({ success: true, payrate });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}


export const removePayrate = async (req, res) => {
    const {id} = req.body;
    try {
        //console.log("B: Entre a removePayrate: ",id);

        if (!id) {
            throw new Error("All fields are required");
        }

        const response = await PayRate.findByIdAndDelete(id)

        if (!response) {
            return res.status(404).json({ success: false, message: "PayRate not found" });
        }

        res.status(200).json({
            success: true,
            message: "PayRate removed successfully",
            service: response._doc
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
