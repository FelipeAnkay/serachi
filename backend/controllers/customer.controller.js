import { Customer } from "../models/customer.model.js";

/*Customer FUNCTIONS */
export const createCustomer = async (req, res) => {
    const { name, lastName, email, phone, gender, country, birthdate, nationalId, emergencyContact, divingCertificates, storeId, languages, diet, allergies } = req.body;
    //console.log("Entre a create customer:", name,"-", email,"-", phone,"-", country,"-", birthdate,"-", nationalId,"-",emergencyContact,"-", divingCertificates,"-", storeId,"-", languages,"-", diet);
    try {
        if (!name || !email || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const customer = new Customer({
            name,
            lastName,
            gender,
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

const excelDateToISO = (excelDate) => {
    // Convierte desde número de días desde 1900-01-01 a fecha JS
    const date = new Date((Number(excelDate) - 25569) * 86400 * 1000);
    return new Date(date.toISOString().split("T")[0]); // Solo la parte YYYY-MM-DD
};

export const createCustomerMasiveBatch = async (req, res) => {
    const customersRaw = req.body;

    if (!Array.isArray(customersRaw) || customersRaw.length === 0) {
        return res.status(400).json({ success: false, message: "Body must be a non-empty array" });
    }

    const errors = [];
    const inserted = [];

    for (const data of customersRaw) {
        try {
            const {
                name, lastName, email, phone,
                gender, country, birthdate, nationalId,
                emergencyContact = {}, divingCertificates = [],
                storeId, languages = [], diet, allergies
            } = data;

            if (!name || !email || !storeId) {
                throw new Error("Missing required fields: name, email, or storeId");
            }

            const customer = new Customer({
                name,
                lastName,
                gender,
                email,
                phone,
                country,
                birthdate: excelDateToISO(birthdate),
                nationalId,
                diet,
                allergies,
                languages,
                emergencyContact,
                divingCertificates,
                storeId: storeId.toUpperCase()
            });

            await customer.save();
            inserted.push(customer);

        } catch (error) {
            console.error("❌ Error inserting:", data.email, error.message);
            errors.push({ email: data.email, message: error.message });
        }
    }

    return res.status(201).json({
        success: true,
        message: "Batch customer creation completed",
        insertedCount: inserted.length,
        failedCount: errors.length,
        errors
    });
};

export const updateCustomer = async (req, res) => {
    const { email, storeId, ...updateFields } = req.body;
    console.log("B: Entre a updateCustomer", email, " - ", storeId, " - ", updateFields)
    try {
        if (!email) {
            throw new Error("Id field is required");
        }
        const normalizedStoreId = storeId?.toUpperCase();
        const filter = { email: email, storeId: normalizedStoreId }

        const customer = await Customer.findOneAndUpdate(filter, updateFields, {
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
        const { storeId } = req.params
        console.log("Entre a customerList ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const customerList = await Customer.find({ storeId: normalizeStoreID });
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
        const { email, storeId } = req.params
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

export const createIndex = async (req, res) => {
    try {
        const indexes = await Customer.syncIndexes();
        res.status(200).json({ success: true, indexes });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

}