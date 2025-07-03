import { Experience } from "../models/experience.model.js";

/*EXPERIENCE FUNCTIONS */
export const createExperience = async (req, res) => {
    const { name, serviceList, productList, bookList, storeId, userEmail, customerEmail, dateIn, dateOut, quoteId } = req.body;
    try {

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

        res.status(200).json({
            success: true,
            message: "Experience updated succesfully",
            experience: {
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
        const { storeId } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();
        const experienceList = await Experience.find({storeId: normalizedStoreId});
        //console.log("El listado de experiencias es:", experienceList);
        if (!experienceList) {
            //console.log("ENTRE A NoExp");
            return res.status(200).json({ success: false, message: "Experiences not found" });
        }
        res.status(200).json({ success: true, experienceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getExperienceByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params;
        //console.log(" getExperienceByEmail las variables son: ", email, " - ", storeId)
        const normalizedStoreId = storeId?.toUpperCase();
        const experienceList = await Experience.find({ customerEmail: email, storeId: normalizedStoreId });
        //console.log(" Respuesta de Experience.find: ", experienceList)
        if (!experienceList) {
            return res.status(400).json({ success: false, message: "Experience not found" });
        }
        res.status(200).json({ success: true, experienceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getValidExperienceByEmail = async (req, res) => {
    try {
        const { email, storeId } = req.params;
        const today = new Date();
        //console.log(" getExperienceByEmail las variables son: ", email, " - ", storeId)
        const normalizedStoreId = storeId?.toUpperCase();
        const experienceList = await Experience.find({ customerEmail: email, storeId: normalizedStoreId, dateOut:{$gte: today }});
        //console.log(" Respuesta de Experience.find: ", experienceList)
        if (!experienceList) {
            return res.status(400).json({ success: false, message: "Experience not found" });
        }
        res.status(200).json({ success: true, experienceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getExperienceById = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log(" getExperienceByEmail las variables son: ", email, " - ", storeId)
        const experience = await Experience.findById(id);
        //console.log(" Respuesta de Experience.find: ", experienceList)
        if (!experience) {
            return res.status(400).json({ success: false, message: "Experience not found" });
        }
        res.status(200).json({ success: true, experience });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const removeServicesFromExperiences = async (req, res) => {
    try {
        const { serviceIds } = req.body;

        if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({ success: false, message: "No serviceIds provided" });
        }

        // Encuentra todas las experiencias que contienen al menos uno de los serviceIds
        const experiences = await Experience.find({ serviceList: { $in: serviceIds } });

        if (!experiences || experiences.length === 0) {
            return res.status(200).json({ success: true, message: "No experiences contain those serviceIds", updatedCount: 0 });
        }

        let updatedCount = 0;

        for (const exp of experiences) {
            const originalLength = exp.serviceList.length;

            // Filtra para eliminar los serviceIds del array
            exp.serviceList = exp.serviceList.filter(id => !serviceIds.includes(id));

            if (exp.serviceList.length !== originalLength) {
                await exp.save();
                updatedCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Services removed from ${updatedCount} experience(s)`,
            updatedCount
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getExperiencesByCheckout = async (req, res) => {
    try {
        const {storeId} = req.params;
        const normalizeStoreID = storeId?.toUpperCase();
        //console.log("Entre a getExperiencesByCheckout: ", normalizeStoreID);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0); // 00:00:00.000
        const experienceList = await Experience.find({
            storeId: normalizeStoreID,
            dateOut: {$gte: startOfToday },
        });
        //console.log("experienceList: ", experienceList)
        if (experienceList.length === 0) {
            return res.status(200).json({ success: false, message: "No Experiences found" });
        }
        res.status(200).json({ success: true, experienceList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}