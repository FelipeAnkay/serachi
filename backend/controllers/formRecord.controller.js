import { FormRecord } from "../models/formRecord.model.js";

/*BOOK FUNCTIONS */
export const createFormRecord = async (req, res) => {
    const { customerEmail, formTxt, storeId, formName, date, answers, signature, signatureGuardian, signedAt } = req.body;
    try {
        if (!customerEmail || !storeId ||!formTxt || !answers || !formName) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const formRecord = new FormRecord({
            customerEmail,
            formName,
            formTxt,
            date,
            answers,
            signature,
            signatureGuardian,
            signedAt,
            storeId: normalizedStoreId
        })

        await formRecord.save();

        res.status(201).json({
            success: true,
            message: "formRecord created succesfully",
            formRecord: {
                ...formRecord._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateFormRecord = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const formRecord = await FormRecord.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "FormRecord updated succesfully",
            formRecord: {
                ...formRecord._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getFormRecordsById = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log("B: Llamado a getServiceByID: ", id);
        const formRecord = await FormRecord.findById(id);
        if (!formRecord) {
            return res.status(400).json({ success: false, message: "formRecord not found" });
        }
        res.status(200).json({ success: true, formRecord });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getFormsRecordsByStoreId = async (req, res) => {
    try {
        const { storeId } = req.params
        //console.log("B: Llamado a getServiceByID: ", id);
        const normalizeStoreID = storeId?.toUpperCase();
        const formRecordList = await FormRecord.find({ storeId: normalizeStoreID });
        if (!formRecordList) {
            return res.status(400).json({ success: false, message: "formList not found" });
        }
        res.status(200).json({ success: true, formRecordList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getFormRecordsByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();
        const formRecordList = await FormRecord.find({ customerEmail: email, storeId: normalizedStoreId });
        if (!formRecordList) {
            return res.status(400).json({ success: false, message: "formRecordList not found" });
        }
        res.status(200).json({ success: true, formRecordList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};