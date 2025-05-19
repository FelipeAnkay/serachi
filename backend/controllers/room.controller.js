import { Room } from "../models/room.model.js";

/*ROOM FUNCTIONS */
export const createRoom = async (req, res) => {
    const { name, availability, type, storeId, price, currency, userEmail, isActive } = req.body;
    try {
        if (!name || !availability || !storeId || !type || !price || !userEmail) {
            throw new Error("All fields are required");
        }

        const room = new Room({
            name,
            availability,
            type,
            storeId: storeId?.toUpperCase(),
            price,
            currency,
            userEmail,
            isActive
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

export const roomList = async (req, res) => {
    try {
        console.log("Entre a roomList")
        const { storeId } = req.params
        console.log("B: el storeID para roomList es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const roomList = await Room.find({ storeId: normalizeStoreID });
        console.log("El listado de Rooms es:", roomList);
        if (!roomList || roomList.length === 0) {
            return res.status(200).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, roomList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getRoomById = async (req, res) => {
    try {
        const {id} = req.params;
        const room = await Room.findById(id);
        if (!room) {
            return res.status(400).json({ success: false, message: "room not found" });
        }
        res.status(200).json({ success: true, room });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}