import { Room } from "../models/room.model.js";

/*ROOM FUNCTIONS */
export const createRoom = async (req, res) => {
    const { name, availability, storeId } = req.body;
    try {
        if (!name || !availability || !storeId) {
            throw new Error("All fields are required");
        }

        const room = new Room({
            name,
            availability,
            storeId
        })

        await room.save();

        res.status(201).json({
            success: true,
            message: "Room created succesfully",
            service: {
                ...room._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateRoom = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const room = await Room.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "Room updated succesfully",
            service: {
                ...room._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
