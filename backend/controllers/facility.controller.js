import { Facility } from "../models/facility.model.js";


/*Facility FUNCTIONS */
export const createFacility = async (req, res) => {
    const { name, availability, storeId } = req.body;
    //console.log("Entre a createFacility")
    try {
        if (!name || !availability || !storeId) {
            throw new Error("All fields are required");
        }

        const facility = new Facility({
            name,
            availability,
            storeId: storeId?.toUpperCase()
        })

        await facility.save();

        res.status(201).json({
            success: true,
            message: "facility created succesfully",
            facility: {
                ...facility._doc
            }
        })

    } catch (error) {
        //console.log("Error en create Facility: ", error)
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateFacility = async (req, res) => {
    const { id, ...updateFields } = req.body;
    //console.log("Entre a updateFacility", {id, updateFields})
    try {
        if (!id) {
            throw new Error("Id field is required");
        }
        const facility = await Facility.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        await facility.save();

        res.status(201).json({
            success: true,
            message: "facility updated succesfully",
            facility: {
                ...facility._doc
            }
        })

    } catch (error) {
        //console.error("Error actualizando facility: ", error)
        res.status(400).json({ success: false, message: error.message });
    }
}

export const facilityList = async (req, res) => {
    try {
        //console.log("Entre a roomList")
        const { storeId } = req.params
        //console.log("B: el storeID para roomList es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const facilityList = await Facility.find({ storeId: normalizeStoreID });
        //console.log("El listado de facilityList es:", facilityList);
        if (!facilityList || facilityList.length === 0) {
            return res.status(200).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, facilityList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getFacilityById = async (req, res) => {
    try {
        const {id} = req.params;
        const facility = await Facility.findById(id);
        if (!facility) {
            return res.status(400).json({ success: false, message: "facility not found" });
        }
        res.status(200).json({ success: true, facility });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

