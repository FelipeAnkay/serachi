import { Customer } from "../models/customer.model.js";

/*Customer FUNCTIONS */
export const createCustomer = async (req, res) => {
    const { name, lastName, email, phone, country, birthdate, nationalId, emergencyContact, divingCertificates, storeId, languages, diet, allergies } = req.body;
    //console.log("Entre a create customer:", name,"-", email,"-", phone,"-", country,"-", birthdate,"-", nationalId,"-",emergencyContact,"-", divingCertificates,"-", storeId,"-", languages,"-", diet);
    try {
        if (!name || !email || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const customer = new Customer({
            name,
            lastName,
            email,
            phone,
            country,
            birthdate,
            nationalId,
            diet,
            allergies,
            languages,
            emergencyContact,
            divingCertificates,
            storeId: normalizedStoreId
        });

        await customer.save();

        res.status(201).json({
            success: true,
            message: "Customer created succesfully",
            service: {
                ...customer._doc
            }
        })

    } catch (error) {
        console.error("Error creando cliente: ", error)
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateCustomer = async (req, res) => {
    const { email, storeId, ...updateFields } = req.body;
    console.log("B: Entre a updateCustomer", email, " - ", storeId, " - ",updateFields)
    try {
        if (!email) {
            throw new Error("Id field is required");
        }
        const normalizedStoreId = storeId?.toUpperCase();
        const filter = {email: email, storeId: normalizedStoreId}

        const customer = await Customer.findOneAndUpdate( filter , updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Customer updated succesfully",
            service: {
                ...customer._doc
            }
        })

    } catch (error) {
        console.error("Error actualizando cliente: ", error)
        res.status(400).json({ success: false, message: error.message });
    }
}

export const customerList = async (req, res) => {
    try {
        const {storeId} = req.params
        console.log("Entre a customerList ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const customerList = await Customer.find({ storeId: normalizeStoreID});
        console.log("El listado de clientes es:", customerList);
        if (!customerList) {
            return res.status(400).json({ success: false, message: "Customer not found" });
        }
        res.status(200).json({ success: true, customerList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const customerByEmail = async (req, res) => {
    try {
        //console.log("Entre a customerByEmail")
        const { email,storeId } = req.params
        const normalizeStoreID = storeId?.toUpperCase();
        //console.log("B: el storeID para customerByEmail es: ", email)
        if (!email) {
            throw new Error("Email is required");
        }
        const customerList = await Customer.find({ email: email, storeId: normalizeStoreID });
        //console.log("El listado de customer es:", customerList);
        if (!customerList || customerList.length === 0) {
            //console.log("B: NO ENCONTRE AL CLIENTE");
            return res.status(200).json({ success: false, message: "Customer not found" });
        }
        res.status(200).json({ success: true, customerList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const createIndex = async (req,res) => {
    try {
        const indexes = await Customer.syncIndexes();
        res.status(200).json({ success: true, indexes });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
    
}