import { PRrecord } from '../models/prrecord.model.js';
/*Quote FUNCTIONS */
export const createPRrecord = async (req, res) => {
    const { dateInit, dateEnd, recordDetail, tag, type, userEmail, storeId } = req.body;
    //console.log("B: createQuote data: ", dateIn ," - ", dateOut," - ",customerEmail," - ",customerName," - ",storeId," - ",roomId," - ",partnerId," - ",discount," - ",finalPrice," - ",currency," - ",isConfirmed," - ",isReturningCustomer," - ",userEmail," - ",userName," - "," - ",tag)
    try {
        if (!dateInit || !dateEnd || !storeId || !userEmail || !recordDetail) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const prrecord = new PRrecord({
            dateInit,
            dateEnd, 
            recordDetail, 
            tag, 
            type, 
            userEmail,
            storeId: normalizedStoreId
        });

        await prrecord.save();

        res.status(201).json({
            success: true,
            message: "prrecord created succesfully",
            service: {
                ...prrecord._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updatePRrecord = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const prrecord = await PRrecord.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "prrecord updated succesfully",
            service: {
                ...prrecord._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const prrecordList = async (req, res) => {
    try {
        const { storeId } = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const prrecordList = await PRrecord.find({ storeId: normalizeStoreID });
        //console.log("El listado de prrecord es:", prrecordList);
        if (!prrecordList) {
            return res.status(400).json({ success: false, message: "prrecord not found" });
        }
        res.status(200).json({ success: true, prrecordList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}


export const getPRrecordById = async (req, res) => {
    try {
        const { id } = req.params;
        const prrecord = await PRrecord.findById(id);
        if (!prrecord) {
            return res.status(400).json({ success: false, message: "prrecord not found" });
        }
        res.status(200).json({ success: true, prrecord });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}