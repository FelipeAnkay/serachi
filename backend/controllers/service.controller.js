import { Service } from "../models/service.model.js";

/*SERVICE FUNCTIONS */
export const createService = async (req, res) => {
    const { name, productId, quoteId, facilityId, staffEmail, customerEmail, dateIn, dateOut, storeId, userEmail, type, payrollList, isPaid } = req.body;
    try {
        if (!name || !productId || !storeId || !userEmail) {
            throw new Error("All fields are required");
        }

        const normalizeStoreID = storeId?.toUpperCase();

        const service = new Service({
            name,
            productId,
            quoteId,
            facilityId,
            staffEmail,
            customerEmail,
            dateIn,
            dateOut,
            type,
            userEmail,
            payrollList,
            isPaid,
            storeId: normalizeStoreID
        })

        await service.save();

        res.status(201).json({
            success: true,
            message: "service created succesfully",
            service: {
                ...service._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateService = async (req, res) => {
    const { id, ...updateFields } = req.body;
    console.log("B: Llamado recibido con los siguientes parametros: ", req.body);
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const service = await Service.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        console.log("B: service encontrado ", service)

        //await service.save();

        res.status(201).json({
            success: true,
            message: "service updated succesfully",
            service: {
                ...service._doc
            }
        })

    } catch (error) {
        console.log("B: Error en updateService", error)
        res.status(400).json({ success: false, message: error.message });
    }
}
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log("B: Llamado a getServiceByID: ", id);
        const service = await Service.findById(id);
        if (!service) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, service });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getServiceByStoreId = async (req, res) => {
    try {
        const { storeId } = req.params
        //console.log("B: Llamado a getServiceByID: ", id);
        const normalizeStoreID = storeId?.toUpperCase();
        const service = await Service.find({ storeId: normalizeStoreID, type: "Customer" });
        if (!service) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, service });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getServiceNoStaff = async (req, res) => {
    try {
        const { storeId } = req.params;
        //console.log("B: Llamado a getServiceNoStaff: ", storeId);
        const normalizedStoreId = storeId?.toUpperCase();

        const service = await Service.find({
            storeId: normalizedStoreId,
            type: "Customer",
            $or: [
                { staffEmail: { $exists: false } },
                { staffEmail: null },
                { staffEmail: "" }
            ]
        });

        if (!service) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, service });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getServiceNoData = async (req, res) => {
    try {
        const { storeId } = req.params;
        //console.log("B: Llamado a getServiceNoDates: ", storeId);
        const normalizedStoreId = storeId?.toUpperCase();

        const service = await Service.find({
            storeId: normalizedStoreId,
            type: "Customer",
            $or: [
                { dateIn: { $exists: false } },
                { dateIn: null },
                { dateIn: "" }
            ],
            $or: [
                { dateOut: { $exists: false } },
                { dateOut: null },
                { dateOut: "" }
            ],
            $or: [
                { staffEmail: { $exists: false } },
                { staffEmail: null },
                { staffEmail: "" }
            ]
        });

        if (!service) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, service });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const serviceList = async (req, res) => {
    try {
        const storeId = req.storeId
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const serviceList = await Service.find(normalizeStoreID);
        //console.log("El listado de productos es:", serviceList);
        if (!serviceList) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, serviceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getServicesByIds = async (req, res) => {
    try {
        const { ids } = req.params;
        const arrayIds = ids.split(",");
        //console.log("B: Llamado a getServiceByID: ", ids);
        const serviceList = await Service.find({ _id: { $in: arrayIds } });
        //console.log("La respuesta de Service.find: ", serviceList);
        if (!serviceList) {
            return res.status(400).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, serviceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getServiceByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();
        const service = await Service.find({ customerEmail: email, storeId: normalizedStoreId });
        if (!service) {
            return res.status(400).json({ success: false, message: "service not found" });
        }
        res.status(200).json({ success: true, service });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getServiceByDates = async (req, res) => {
    try {
        const { storeId, dateIn, dateOut } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        console.log("Entre a getServiceByDates: ", normalizedStoreId, " - ", dateIn, " - ", dateOut);

        const serviceList = await Service.find({
            storeId: normalizedStoreId,
            type: "Customer",
            dateIn: { $gte: new Date(dateIn) },
            dateOut: { $lte: new Date(dateOut) },
        });

        console.log("Respuesta de Service.find: ", serviceList);

        if (!serviceList || serviceList.length === 0) {
            return res.status(200).json({ success: false, message: "No services found in date range" });
        }

        res.status(200).json({ success: true, serviceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const ChangeType = async (req, res) => {
    try {
        console.log("Entre a ChangeType: ");
        const service = await Service.updateMany(
            { type: "Front" },
            { $set: { type: "Customer" } }
        );

        console.log("Respuesta de Service.find: ", service);

        if (!service || service.length === 0) {
            return res.status(404).json({ success: false, message: "No services found in date range" });
        }

        res.status(200).json({ success: true, service });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            throw new Error("Id field is required");
        }

        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        res.status(200).json({
            success: true,
            message: "Service deleted successfully",
            service: deletedService
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteServiceByEmail = async (req, res) => {
    try {
        const { customerEmail } = req.body;

        if (!customerEmail) {
            throw new Error("customerEmail field is required");
        }

        const deletedResult = await Service.deleteMany({ customerEmail });

        if (deletedResult.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "No services found for that email" });
        }

        res.status(200).json({
            success: true,
            message: `Deleted ${deletedResult.deletedCount} service(s) successfully`,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

