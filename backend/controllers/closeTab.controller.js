import { closeTab } from "../models/closeTab.model.js";

/*closeTab FUNCTIONS */
export const createCloseTab = async (req, res) => {
    const { date, userEmail, customerEmail, closedAmount, productList, serviceList, reservationList, storeId } = req.body;
    try {
        if (!date || !customerEmail || !userEmail || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizeStoreID = storeId?.toUpperCase();

        const closetab  = new closeTab ({
            date, 
            userEmail, 
            customerEmail, 
            closedAmount, 
            productList, 
            serviceList, 
            reservationList, 
            storeId: normalizeStoreID
        })

        await closetab.save();

        res.status(201).json({
            success: true,
            message: "service created succesfully",
            closeTab: {
                ...closetab._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateCloseTab = async (req, res) => {
    const { id, ...updateFields } = req.body;
    //console.log("B: Llamado recibido con los siguientes parametros: ", req.body);
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const closetab = await closeTab.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //console.log("B: service encontrado ", closetab)

        res.status(201).json({
            success: true,
            message: "closetab updated succesfully",
            service: {
                ...closetab._doc
            }
        })

    } catch (error) {
        console.log("B: Error en updateService", error)
        res.status(400).json({ success: false, message: error.message });
    }
}
export const getCloseTabById = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log("B: Llamado a getServiceByID: ", id);
        const closetab = await closeTab.findById(id);
        if (!closetab) {
            return res.status(400).json({ success: false, message: "closetab not found" });
        }
        res.status(200).json({ success: true, closetab });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getCloseTabByStoreId = async (req, res) => {
    try {
        const { storeId } = req.params
        //console.log("B: Llamado a getServiceByID: ", id);
        const normalizeStoreID = storeId?.toUpperCase();
        const closetab = await closeTab.find({ storeId: normalizeStoreID });
        if (!closetab) {
            return res.status(400).json({ success: false, message: "closetab not found" });
        }
        res.status(200).json({ success: true, closetab });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getCloseTabByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();
        const closetab = await closeTab.find({ customerEmail: email, storeId: normalizedStoreId });
        if (!closetab) {
            return res.status(400).json({ success: false, message: "closetab not found" });
        }
        res.status(200).json({ success: true, closetab });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getCloseTabByDates = async (req, res) => {
    try {
        const { storeId, date } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        //console.log("Entre a getServiceByDates: ", normalizedStoreId, " - ", date);

        const closetab = await closeTab.find({
            storeId: normalizedStoreId,
            date: { $lte: new Date(dateOut) },
        });

        //console.log("Respuesta de Service.find: ", closetab);

        if (!closetab || closetab.length === 0) {
            return res.status(200).json({ success: false, message: "No services found in date range" });
        }

        res.status(200).json({ success: true, closetab });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteCloseTab = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            throw new Error("Id field is required");
        }

        const closetab = await closeTab.findByIdAndDelete(id);

        if (!closetab) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.status(200).json({
            success: true,
            message: "closetab deleted successfully",
            service: closetab
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


