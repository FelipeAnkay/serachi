import { Type } from "../models/type.model.js";

/*ROOM FUNCTIONS */
export const createType = async (req, res) => {
    const { name, category, storeId, isActive } = req.body;
    try {
        if (!name || !category || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const type = new Type({
            name,
            category,
            storeId: normalizedStoreId,
        })

        await type.save();

        res.status(201).json({
            success: true,
            message: "type created succesfully",
            service: {
                ...type._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateType = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const type = await Type.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "type updated succesfully",
            service: {
                ...type._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const typeList = async (req, res) => {
    try {
        const {storeId} = req.params
        //console.log("B: Entre a typeList:", storeId);
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const typeList = await Type.find({storeId: normalizeStoreID});
        //console.log("El listado de type es:", typeList);
        if (!typeList) {
            return res.status(400).json({ success: false, message: "type not found" });
        }
        res.status(200).json({ success: true, typeList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getTypeByCategory = async (req, res) => {
    try {
        const {storeId, category} = req.params
        //console.log("B: Entre a typeList:", storeId);
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const typeList = await Type.find({storeId: normalizeStoreID, category: category});
        //console.log("El listado de type es:", typeList);
        if (!typeList) {
            return res.status(400).json({ success: false, message: "type not found" });
        }
        res.status(200).json({ success: true, typeList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
