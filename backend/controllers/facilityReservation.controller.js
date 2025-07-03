import { Facility } from "../models/facility.model.js";
import { FacilityReservation } from "../models/fReservation.model.js";

/*Facility Reservation FUNCTIONS */
export const createFacilityReservation = async (req, res) => {
    const { facilityId, serviceId, customerEmail, staffEmail, storeId, dateIn, dateOut, spaceReserved, userEmail } = req.body;
    try {
        if (!facilityId || !customerEmail || !serviceId || !storeId || !dateIn || !dateOut || !userEmail) {
            throw new Error("All fields are required");
        }

        const facilityReservation = new FacilityReservation({
            facilityId,
            serviceId,
            customerEmail,
            staffEmail,
            dateIn,
            dateOut,
            spaceReserved,
            userEmail,
            storeId: storeId?.toUpperCase()
        })

        await facilityReservation.save();

        res.status(201).json({
            success: true,
            message: "facility created succesfully",
            facilityReservation: {
                ...facilityReservation._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateFacilityReservation = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const facilityReservation = await FacilityReservation.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        //await service.save();

        res.status(201).json({
            success: true,
            message: "facilityReservation updated succesfully",
            facilityReservation: {
                ...facilityReservation._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const FacilityReservationList = async (req, res) => {
    try {
        console.log("Entre a facilityReservationList")
        const { storeId } = req.params
        //console.log("B: el storeID para facilityReservation es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const facilityReservationList = await FacilityReservation.find({ storeId: normalizeStoreID });
        //console.log("El listado de Reservation es:", facilityReservationList);
        if (!facilityReservationList) {
            return res.status(200).json({ success: false, message: "Reservation not found" });
        }
        res.status(200).json({ success: true, facilityReservationList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const facilityReservationByDates = async (req, res) => {
    try {
        const { storeId, dateIn, dateOut } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        //console.log("Entre a roomReservationByDates: ", normalizedStoreId, " - ", dateIn, " - ", dateOut);

        const facilityReservationList = await FacilityReservation.find({
            storeId: normalizedStoreId,
            dateIn: { $lte: new Date(dateOut) },  // empieza antes o el mismo día que el final del rango
            dateOut: { $gte: new Date(dateIn) },  // termina después o el mismo día que el inicio del rango
        });

        //console.log("Respuesta de roomReservationList.find: ", roomReservationList);

        if (!facilityReservationList || facilityReservationList.length === 0) {
            return res.status(404).json({ success: false, message: "No services found in date range" });
        }

        res.status(200).json({ success: true, facilityReservationList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getAvailableSpaces = async (req, res) => {
    try {
        const { dateIn, dateOut, spaceRequired, storeId } = req.body;
        //console.log("Entre a getAvailableRooms: ", dateIn, " - ", dateOut, " - ", spaceRequired, " - ", storeId)
        const normalizedStoreId = storeId?.toUpperCase();
        const facilities = await Facility.find({ storeId: normalizedStoreId });
        const reservations = await FacilityReservation.find({
            storeId: normalizedStoreId,
            dateIn: { $lt: new Date(dateOut) },
            dateOut: { $gt: new Date(dateIn) }
        });

        //console.log("reservations: ", {reservations});

        // Construir rango de fechas
        const range = [];
        let d = new Date(dateIn);
        const end = new Date(dateOut);
        end.setHours(0, 0, 0, 0);
        //console.log("End es: ", end)
        while (d < end) {
            //console.log("D es: ", d)
            range.push(d.toISOString().split('T')[0]);
            d.setDate(d.getDate() + 1);
        }

        // Mapa: facilityId => { [date]: capacityLeft }
        const facilityAvailabilityMap = {};

        for (const facility of facilities) {
            const daily = {};
            for (const day of range) {
                daily[day] = facility.availability;
            }

            // restar reservas
            reservations
                .filter(r => r.facilityId.toString() === facility._id.toString())
                .forEach(r => {
                    let rd = new Date(r.dateIn);
                    const rdOut = new Date(r.dateOut);
                    while (rd < rdOut) {
                        const day = rd.toISOString().split('T')[0];
                        if (daily[day] !== undefined) {
                            daily[day] -= r.spaceReserved;
                        }
                        rd.setDate(rd.getDate() + 1);
                    }
                });

            facilityAvailabilityMap[facility._id.toString()] = daily;
        }

        // Construir respuesta de facilities con su disponibilidad por fecha
        const detailedFacilities = facilities.map(room => {
            const availableEveryDay = range.every(date => (facilityAvailabilityMap[room._id.toString()][date] || 0) > 0);
            return {
                ...room.toObject(),
                dailyAvailability: facilityAvailabilityMap[room._id.toString()],
                availableEveryDay
            };
        });

        const facilityWithSomeAvailability = detailedFacilities.filter(room =>
            Object.values(room.dailyAvailability || {}).some(val => val > 0)
        );

        res.status(200).json({ availableFacility: facilityWithSomeAvailability });

    } catch (error) {
        //console.error('getAvailableSpaces error:', error);
        res.status(500).json({ message: "Error checking availability", error });
    }
}

export const getFacilityReservationsByEmail = async (req, res) => {
    try {
        //console.log("Entre a getFacilityReservationsByEmail")
        const { email, storeId } = req.params
        //console.log("B: el storeID para getFacilityReservationsByEmail es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const facilityReservationList = await FacilityReservation.find({ storeId: normalizeStoreID, customerEmail: email });
        //console.log("El listado de Reservation es:", roomReservationList);
        if (!facilityReservationList) {
            return res.status(200).json({ success: false, message: "Reservation not found" });
        }
        res.status(200).json({ success: true, facilityReservationList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getReservationsByIds = async (req, res) => {
    try {
        //console.log("Entre a roomReservationList")
        const { ids } = req.params;
        const arrayIds = ids.split(",");
        //console.log("B: el ids para roomReservationList es: ", ids)
        const facilityReservationList = await FacilityReservation.find({ _id: { $in: arrayIds } });
        //console.log("El listado de Reservation es:", roomReservationList);
        if (!facilityReservationList) {
            return res.status(200).json({ success: false, message: "Reservation not found" });
        }
        res.status(200).json({ success: true, facilityReservationList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
