import { Experience } from "../models/experience.model.js";

/*EXPERIENCE FUNCTIONS */
export const createExperience = async (req, res) => {
    const { name, serviceList, productList, bookList, storeId, userEmail, customerEmail, dateIn, dateOut, quoteId } = req.body;
    try {
        const hasAnyItem = 
        (Array.isArray(serviceList) && serviceList.length > 0) ||
        (Array.isArray(productList) && productList.length > 0) ||
        (Array.isArray(bookList) && bookList.length > 0);
        
        console.log("B: hasAnyItem tiene: ", hasAnyItem)

        if (!hasAnyItem) {
            throw new Error("At least one of serviceList, productList or bookList must have items");
        }

        if (!name || !dateIn || !dateOut || !storeId || !customerEmail) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const experience = new Experience({
            name,
            serviceList,
            productList,
            bookList,
            storeId: normalizedStoreId,
            userEmail,
            customerEmail,
            dateIn,
            quoteId,
            dateOut
        });

        await experience.save();

        res.status(201).json({
            success: true,
            message: "Experience created succesfully",
            service: {
                ...experience._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateExperience = async (req, res) => {
    //console.log("B: Llamado recibido con los siguientes parametros: ", req.body);
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const experience = await Experience.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //console.log("B: Experience encontrada: ", experience)

        res.status(201).json({
            success: true,
            message: "Experience updated succesfully",
            service: {
                ...experience._doc
            }
        })

    } catch (error) {
        //console.log("B: Error en updateExperience", error)
        res.status(400).json({ success: false, message: error.message });
    }
}

export const experienceList = async (req, res) => {
    try {
        const experienceList = await Experience.find(req.storeId);
        //console.log("El listado de experiencias es:", experienceList);
        if (!experienceList) {
            return res.status(400).json({ success: false, message: "Experiences not found" });
        }
        res.status(200).json({ success: true, experienceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}