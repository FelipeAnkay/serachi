import { Partner } from "../models/partner.model.js";

/*Partner FUNCTIONS */
export const createPartner = async (req, res) => {
    const { name, email, phone, country, nationalId, storeId } = req.body;
    try {
        if (!name || !email || !country || !storeId) {
            throw new Error("All fields are required");
        }
        console.log("B: Creating Partner", name, " - ", email, " - ", phone, " - ", country, " - ", nationalId, " - ", storeId)
        const normalizedStoreId = storeId?.toUpperCase();

        const partner = new Partner({
            name,
            email,
            phone,
            country,
            nationalId,
            storeId: normalizedStoreId
        });

        await partner.save();

        res.status(201).json({
            success: true,
            message: "partner created succesfully",
            service: {
                ...partner._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updatePartner = async (req, res) => {
    const { email, storeId, ...updateFields } = req.body;
    try {
        if (!email) {
            throw new Error("Id field is required");
        }
        const filter = {email: email, storeId: storeId}
        const partner = await Partner.findOneAndUpdate(filter, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "partner updated succesfully",
            service: {
                ...partner._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const partnerList = async (req, res) => {
    try {
        const { storeId } = req.params
        //console.log("B: Estoy en partnerList", storeId);
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const partnerList = await Partner.find({ storeId: normalizeStoreID });
        //console.log("El listado de partner es:", partnerList);
        if (!partnerList) {
            return res.status(200).json({ success: false, message: "partner not found" });
        }
        res.status(200).json({ success: true, partnerList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const partnerByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params
        const normalizeStoreID = storeId?.toUpperCase();
        console.log("B: el mail para partnerByEmail es: ", email)
        if (!email) {
            throw new Error("Email is required");
        }
        const partnerList = await Partner.find({ email: email, storeId: normalizeStoreID });
        console.log("El listado de partner es:", partnerList);
        if (!partnerList || partnerList.length === 0) {
            return res.status(200).json({ success: false, message: "partner not found" });
        }
        res.status(200).json({ success: true, partnerList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const removePartner = async (req, res) => {
    const { email } = req.body;
    try {
        console.log("B: Entre a removeStaff: ", email)
        if (!email) {
            throw new Error("All field are required");
        }
        const filter = { email: email }
        const partner = await Partner.findOne(filter);
        console.log("B: partner: ", partner)
        if (!partner) {
            return res.status(404).json({ success: false, message: "partner not found" });
        }

        partner.isActive = false;
        await partner.save();

        res.status(201).json({
            success: true,
            message: "partner updated succesfully",
            service: {
                ...partner._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const createIndex = async (req,res) => {
    try {
        const indexes = await Partner.syncIndexes();
        res.status(200).json({ success: true, indexes });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
    
}