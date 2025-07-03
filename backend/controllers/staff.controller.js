import { Staff } from "../models/staff.model.js";
import { sendScheduleEmail } from "../mailtrap/emails.js";

/*Staff FUNCTIONS */
export const createStaff = async (req, res) => {
    const { name, email, phone, country, birthdate, nationalId, languages, type,color, professionalCertificates, storeId } = req.body;
    try {
        if (!name || !email || !phone || !country || !birthdate || !languages|| !nationalId || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const staff = new Staff({
            name,
            email,
            phone,
            country,
            birthdate,
            nationalId,
            color,
            type,
            professionalCertificates,
            languages,
            storeId: normalizedStoreId
        });

        await staff.save();

        res.status(201).json({
            success: true,
            message: "Staff created succesfully",
            service: {
                ...staff._doc
            }
        })

    } catch (error) {
        console.error("Error creating staff: ", error)
        res.status(400).json({ success: false, message: error.message });
    }
}

export const staffList = async (req, res) => {
    try {
        //console.log("Entre a staffList")
        const {storeId} = req.params
        //console.log("B: el storeID para staffList es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const staffList = await Staff.find({ storeId: normalizeStoreID });
        //console.log("El listado de Staff es:", staffList);
        if (!staffList || staffList.length === 0) {
            return res.status(400).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, staffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const staffListByType = async (req, res) => {
    try {
        console.log("Entre a staffList")
        const {storeId, type} = req.params
        console.log("B: el storeID para staffListByType es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const staffList = await Staff.find({ storeId: normalizeStoreID, type: type});
        console.log("El listado de Staff es:", staffList);
        if (!staffList || staffList.length === 0) {
            return res.status(400).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, staffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const updateStaff = async (req, res) => {
    const { email, storeId, ...updateFields } = req.body;
    try {
        //console.log("B: Entre a updateStaff: ", email," StoreiD: ", storeId, " Variables a actualizar: ", updateFields)
        if (!email || !storeId) {
            throw new Error("Id field is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const filter = { email: email, storeId:normalizeStoreID }

        const staff = await Staff.findOne(filter);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        const normalizedStoreId = storeId.toUpperCase();
        const hasStore = staff.storeId.includes(normalizedStoreId);
        
        if (!hasStore) {
            staff.storeId.push(normalizedStoreId);
        }

        Object.assign(staff, updateFields);
        await staff.save();

        res.status(201).json({
            success: true,
            message: "Staff updated succesfully",
            service: {
                ...staff._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const removeStaff = async (req, res) => {
    const {email, storeId} = req.body;
    try {
        console.log("B: Entre a removeStaff: ", email," StoreiD: ", storeId)
        if (!email || !storeId) {
            throw new Error("All field are required");
        }
        const filter = { email: email }
        const staff = await Staff.findOne(filter);

        if (!staff) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }

        const normalizedStoreId = storeId.toUpperCase();
        const hasStore = staff.storeId.includes(normalizedStoreId);
        
        if (!hasStore) {
            return res.status(404).json({ success: false, message: "Staff not assigned to this Store" });
        }
        const index = staff.storeId.indexOf(normalizedStoreId);
        staff.storeId.splice(index,1);
        await staff.save();

        res.status(201).json({
            success: true,
            message: "Staff updated succesfully",
            service: {
                ...staff._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const staffByEmail = async (req, res) => {
    try {
        //console.log("Entre a staffByEmail")
        const {email,storeId} = req.params
        //console.log("B: el storeID para staffByEmail es: ", email)
        if (!email) {
            throw new Error("Email is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const staffList = await Staff.findOne({
            email: email,
            storeId: normalizeStoreID  // busca dentro del array de storeIds
        });
        //console.log("El listado de Staff es:", staffList);
        if (!staffList || staffList.length === 0) {
            return res.status(200).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, staffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const createIndex = async (req,res) => {
    try {
        const indexes = await Staff.syncIndexes();
        res.status(200).json({ success: true, indexes });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
    
}

export const postScheduleEmail = async (req, res) => {
    try {
        const { staff, user, store, urlToken } = req.body;
        /*
        console.log("postProfileEmail variables:", {
            customer,
            user,
            store,
            urlToken
        });
        */
        const webUrl = 'https://serachi.net/view-experience'
        const mailSent = await sendScheduleEmail(staff.email, staff.name, user.email, user.name, store.name, webUrl,urlToken);
        //console.log("Respuesta de sendProfileEmail: ", mailSent)
        res.status(200).json({ success: true, mailSent});
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}