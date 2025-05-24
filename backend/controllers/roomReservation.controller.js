import { RoomReservation } from "../models/roomReservation.model.js";
import { Room } from "../models/room.model.js";

/*ROOM Reservation FUNCTIONS */
export const createRoomReservation = async (req, res) => {
    const { roomId, quoteId, customerEmail, storeId, dateIn, dateOut, bedsReserved, userEmail } = req.body;
    try {
        if (!roomId || !customerEmail || !storeId || !dateIn || !dateOut || !bedsReserved || !userEmail) {
            throw new Error("All fields are required");
        }

        const roomReservation = new RoomReservation({
            roomId,
            quoteId,
            customerEmail,
            storeId: storeId?.toUpperCase(),
            dateIn,
            dateOut,
            bedsReserved,
            userEmail
        })

        await roomReservation.save();

        res.status(201).json({
            success: true,
            message: "Room created succesfully",
            service: {
                ...roomReservation._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateRoomReservation = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const roomReservation = await RoomReservation.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "Room updated succesfully",
            service: {
                ...roomReservation._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const roomReservationList = async (req, res) => {
    try {
        console.log("Entre a roomReservationList")
        const { storeId } = req.params
        console.log("B: el storeID para roomReservationList es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const roomReservationList = await RoomReservation.find({ storeId: normalizeStoreID });
        //console.log("El listado de Reservation es:", roomReservationList);
        if (!roomReservationList) {
            return res.status(200).json({ success: false, message: "Reservation not found" });
        }
        res.status(200).json({ success: true, roomReservationList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const roomReservationByDates = async (req, res) => {
    try {
        const { storeId, dateIn, dateOut } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        //console.log("Entre a roomReservationByDates: ", normalizedStoreId, " - ", dateIn, " - ", dateOut);

        const roomReservationList = await RoomReservation.find({
            storeId: normalizedStoreId,
            dateIn: { $gte: new Date(dateIn) },
            dateOut: { $lte: new Date(dateOut) },
        });

        //console.log("Respuesta de roomReservationList.find: ", roomReservationList);

        if (!roomReservationList || roomReservationList.length === 0) {
            return res.status(404).json({ success: false, message: "No services found in date range" });
        }

        res.status(200).json({ success: true, roomReservationList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getAvailableRooms = async (req, res) => {
    try {
        const { dateIn, dateOut, bedsRequired, storeId } = req.body;

        const normalizedStoreId = storeId?.toUpperCase();
        const rooms = await Room.find({ storeId: normalizedStoreId });
        const reservations = await RoomReservation.find({
            storeId: normalizedStoreId,
            $or: [
                { dateIn: { $lt: dateOut }, dateOut: { $gt: dateIn } }
            ]
        });

        // Construir rango de fechas
        const range = [];
        let d = new Date(dateIn);
        const end = new Date(dateOut);
        while (d < end) {
            range.push(d.toISOString().split('T')[0]);
            d.setDate(d.getDate() + 1);
        }

        // Mapa: roomId => { [date]: capacityLeft }
        const roomAvailabilityMap = {};

        for (const room of rooms) {
            const daily = {};
            for (const day of range) {
                daily[day] = room.availability;
            }

            // restar reservas
            reservations
                .filter(r => r.roomId.toString() === room._id.toString())
                .forEach(r => {
                    let rd = new Date(r.dateIn);
                    const rdOut = new Date(r.dateOut);
                    while (rd < rdOut) {
                        const day = rd.toISOString().split('T')[0];
                        if (daily[day] !== undefined) {
                            daily[day] -= r.bedsReserved;
                        }
                        rd.setDate(rd.getDate() + 1);
                    }
                });

            roomAvailabilityMap[room._id.toString()] = daily;
        }

        // Construir respuesta de habitaciones con su disponibilidad por fecha
        const detailedRooms = rooms.map(room => {
            const availableEveryNight = range.every(date => (roomAvailabilityMap[room._id.toString()][date] || 0) > 0);
            return {
                ...room.toObject(),
                dailyAvailability: roomAvailabilityMap[room._id.toString()],
                availableEveryNight
            };
        });

        const roomsWithSomeAvailability = detailedRooms.filter(room =>
            Object.values(room.dailyAvailability || {}).some(val => val > 0)
        );

        res.status(200).json({ availableRooms: roomsWithSomeAvailability });

    } catch (error) {
        console.error('getAvailableRooms error:', error);
        res.status(500).json({ message: "Error checking availability", error });
    }
};

export const splitRoomReservation = async (req, res) => {
    try {
        const { dateIn, dateOut, bedsRequired, storeId } = req.body;
        const rooms = await Room.find({ storeId });
        const reservations = await RoomReservation.find({
            storeId,
            $or: [
                { dateIn: { $lt: dateOut }, dateOut: { $gt: dateIn } }
            ]
        });

        const dateList = [];
        let current = new Date(dateIn);
        const end = new Date(dateOut);
        while (current < end) {
            dateList.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        const suggestion = [];
        for (let i = 0; i < dateList.length; i++) {
            const currentDate = dateList[i];
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);

            const available = rooms.find(room => {
                const reservationsOnDate = reservations.filter(r => {
                    return (
                        r.roomId === room._id.toString() &&
                        r.dateIn <= currentDate &&
                        r.dateOut > currentDate
                    );
                });

                const reservedBeds = reservationsOnDate.reduce((sum, r) => sum + r.bedsReserved, 0);
                if (room.type === "PRIVATE") {
                    return reservedBeds === 0;
                } else {
                    return (room.capacity - reservedBeds) >= bedsRequired;
                }
            });

            if (available) {
                const last = suggestion[suggestion.length - 1];
                if (last && last.roomId === available._id.toString() && last.dateOut.toDateString() === currentDate.toDateString()) {
                    last.dateOut = nextDate;
                } else {
                    suggestion.push({
                        roomId: available._id.toString(),
                        dateIn: currentDate,
                        dateOut: nextDate,
                        beds: bedsRequired,
                    });
                }
            } else {
                return res.status(200).json({
                    segments: [],
                    suggestionText: "No hay disponibilidad continua o dividida para el rango de fechas solicitado."
                });
            }
        }

        res.status(200).json({
            segments: suggestion,
            suggestionText: `Reserva sugerida dividida en ${suggestion.length} tramos.`
        });
    } catch (error) {
        res.status(500).json({ message: "Error suggesting split reservation", error });
    }
}
    