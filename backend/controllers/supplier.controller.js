import { Supplier } from "../models/supplier.model.js";

/*Supplier FUNCTIONS */
export const createSupplier = async (req, res) => {
    const { email, name, phone, country, nationalId, storeId } = req.body;
    try {
        if (!name || !email || !phone || !country || !nationalId || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const supplier = new Supplier({
            name,
            email,
            phone,
            country,
            nationalId,
            storeId: normalizedStoreId
        });

        await supplier.save();

        res.status(201).json({
            success: true,
            message: "supplier created succesfully",
            service: {
                ...supplier._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateSupplier = async (req, res) => {
    const { email, storeId, ...updateFields } = req.body;
    try {
        if (!email) {
            throw new Error("Id field is required");
        }
        const normalizedStoreId = storeId?.toUpperCase();
        const filter = {email: email, storeId: normalizedStoreId}
        const supplier = await Supplier.findOneAndUpdate(filter, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "supplier updated succesfully",
            service: {
                ...supplier._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const supplierList = async (req, res) => {
    try {
        const {storeId} = req.params
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const supplierList = await Supplier.find({storeId: normalizeStoreID});
        console.log("El listado de supplier es:", supplierList);
        if (!supplierList) {
            return res.status(400).json({ success: false, message: "supplier not found" });
        }
        res.status(200).json({ success: true, supplierList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const supplierByEmail = async (req, res) => {
    try {
        console.log("Entre a supplierByEmail")
        const {email, storeId} = req.params
        const normalizeStoreID = storeId?.toUpperCase();
        console.log("B: el storeID para supplierByEmail es: ", email)
        if (!email) {
            throw new Error("Email is required");
        }
        const supplierList = await Supplier.find({ email: email, storeId: normalizeStoreID });
        console.log("El listado de supplier es:", supplierList);
        if (!supplierList || supplierList.length === 0) {
            return res.status(200).json({ success: false, message: "supplier not found" });
        }
        res.status(200).json({ success: true, supplierList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const createIndex = async (req,res) => {
    try {
        const indexes = await Supplier.syncIndexes();
        res.status(200).json({ success: true, indexes });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
    
}