import { Store } from "../models/store.model.js"

/*STORE FUNCTIONS */
export const createStore = async (req, res) => {
    const { name, mainEmail, address, storeId, phone,timezone,userList,daysClosed,tcLink } = req.body;

    try {
        if (!name || !mainEmail || !phone) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        //console.log("Tienda normalizada: ", normalizedStoreId)

        const store = new Store({
            name,
            mainEmail,
            address,
            storeId: normalizedStoreId,
            phone,
            timezone,
            userList,
            daysClosed,
            tcLink
        });

        await store.save();

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            service: {
                ...store._doc
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateStore = async (req, res) => {
    const { storeId, ...updateFields } = req.body;
    try {
        if (!storeId) {
            throw new Error("Id field is required");
        }
        const normalizedStoreId = storeId?.toUpperCase();
        const filter = { storeId: normalizedStoreId }
        const store = await Store.findOneAndUpdate(filter, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Store updated succesfully",
            store: {
                ...store._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const normalizedStoreId = id?.toUpperCase();
        const filter = { storeId: normalizedStoreId }
        //console.log("B: Llamado a getStoreById: ", normalizedStoreId, " - ", filter);
        const store = await Store.findOne(filter);
        if (!store) {
            return res.status(400).json({ success: false, message: "store not found" });
        }
        //console.log("B: Respuesta de getStoreById: ", store);
        res.status(200).json({ success: true, store });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const usersCompany = async (req, res) => {
    try {
        const { storeId } = req.params;
        console.log("El storeId es:", storeId);
        const normalizedStoreId = storeId?.toUpperCase();
        const userList = await Store.findOne({storeId: normalizedStoreId}).select("userList");
        console.log("El listado de usuarios es:", userList);
        if (!userList) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, userList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
