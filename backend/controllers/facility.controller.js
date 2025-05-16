import { Facility } from "../models/facility.model.js";


/*Facility FUNCTIONS */
export const createFacility = async (req, res) => {
    const { name, availability, storeId } = req.body;
    try {
        if (!name || !availability || !storeId) {
            throw new Error("All fields are required");
        }

        const facility = new Facility({
            name,
            availability,
            storeId
        })

        await facility.save();

        res.status(201).json({
            success: true,
            message: "facility created succesfully",
            service: {
                _id,
                ...facility._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateFacility = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const facility = await Facility.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "facility updated succesfully",
            service: {
                ...facility._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

