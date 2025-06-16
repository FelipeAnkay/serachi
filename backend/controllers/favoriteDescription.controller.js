import { FavoriteDescription } from "../models/favoriteDescription.model.js";

/*Favorite Description FUNCTIONS */
export const createFavoriteDescription = async (req, res) => {
    const { type, description, userEmail, storeId } = req.body;
    //console.log("Entre a createFavoriteDescription", {type, description, userEmail, storeId});
    try {
        //console.log("Entre a createFavoriteDescription", {type, description, userEmail, storeId});

        if (!type || !description || !userEmail || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        //console.log("normalizedStoreId: ", normalizedStoreId)

        const fd = new FavoriteDescription({
            type,
            description,
            userEmail,
            storeId: normalizedStoreId,
        })

        await fd.save();
        //console.log("Respuesta: ", {...fd._doc})
        res.status(201).json({
            success: true,
            message: "fd created succesfully",
            favoriteDescription: {
                ...fd._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateFavoriteDescription = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const fd = await FavoriteDescription.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "FavoriteDescription updated succesfully",
            favoriteDescription: {
                ...fd._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const favoriteDescriptionList = async (req, res) => {
    try {
        const {storeId, type} = req.params
        //console.log("B: Entre a typeList:", storeId);
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const favoriteDescriptionList = await FavoriteDescription.find({storeId: normalizeStoreID});
        //console.log("El listado de type es:", typeList);
        if (!favoriteDescriptionList) {
            return res.status(400).json({ success: false, message: "fd not found" });
        }
        res.status(200).json({ success: true, favoriteDescriptionList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const removeFavoriteDescription = async (req, res) => {
    const {id} = req.body;
    try {
        //console.log("B: Entre a removePayrate: ",id);

        if (!id) {
            throw new Error("All fields are required");
        }

        const response = await FavoriteDescription.findByIdAndDelete(id)

        if (!response) {
            return res.status(404).json({ success: false, message: "Favorite Description not found" });
        }

        res.status(200).json({
            success: true,
            message: "Favorite Description removed successfully",
            FavoriteDescription: response._doc
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

