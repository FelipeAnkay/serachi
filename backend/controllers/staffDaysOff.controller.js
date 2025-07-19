import { Staff } from "../models/staff.model.js";
import { StaffDaysOff } from "../models/staffDaysOff.model.js";

/*Facility Reservation FUNCTIONS */
export const createStaffDaysOff = async (req, res) => {
    const { staffEmail, storeId, dateIn, dateOut, userEmail } = req.body;
    try {
        if (!storeId || !dateIn || !dateOut || !userEmail) {
            throw new Error("All fields are required");
        }

        const daysOff = new StaffDaysOff({
            staffEmail,
            dateIn,
            dateOut,
            userEmail,
            storeId: storeId?.toUpperCase()
        })

        await daysOff.save();

        res.status(201).json({
            success: true,
            message: "Days Off created succesfully",
            daysOff: {
                ...daysOff._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateStaffDaysOff = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const staffDaysOff = await StaffDaysOff.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        await StaffDaysOff.save();

        res.status(201).json({
            success: true,
            message: "Staff days off updated succesfully",
            staffDaysOff: {
                ...staffDaysOff._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const removeStaffDaysOff = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await StaffDaysOff.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: `Days off deleted`,
      daysOff: {
        ...result._doc
      }
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message });
  }
}

export const StaffDaysOffList = async (req, res) => {
    try {
        //console.log("Entre a StaffDaysOffList")
        const { storeId } = req.params
        //console.log("B: el storeID para facilityReservation es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const staffDaysOffList = await StaffDaysOff.find({ storeId: normalizeStoreID });
        //console.log("El listado de Reservation es:", facilityReservationList);
        if (!staffDaysOffList) {
            return res.status(200).json({ success: false, message: "Staff days off not found" });
        }
        res.status(200).json({ success: true, staffDaysOffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const StaffDaysOffByDates = async (req, res) => {
    try {
        const { storeId, dateIn, dateOut } = req.params;
        const normalizedStoreId = storeId?.toUpperCase();

        //console.log("Entre a roomReservationByDates: ", normalizedStoreId, " - ", dateIn, " - ", dateOut);

        const staffDaysOffList = await StaffDaysOff.find({
            storeId: normalizedStoreId,
            dateIn: { $lte: new Date(dateOut) },  // empieza antes o el mismo día que el final del rango
            dateOut: { $gte: new Date(dateIn) },  // termina después o el mismo día que el inicio del rango
        });

        //console.log("Respuesta de roomReservationList.find: ", roomReservationList);

        if (!staffDaysOffList || staffDaysOffList.length === 0) {
            return res.status(404).json({ success: false, message: "No days off found in date range" });
        }

        res.status(200).json({ success: true, staffDaysOffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getStaffAvailable = async (req, res) => {
    try {
        const { dateIn, dateOut, storeId } = req.body;

        if (!dateIn || !dateOut || !storeId) {
            return res.status(400).json({ message: "Missing required fields: dateIn, dateOut, storeId" });
        }

        const normalizedStoreId = storeId.toUpperCase();

        // 1. Obtener todos los staff del store
        const staffList = await Staff.find({ storeId: normalizedStoreId });

        // 2. Obtener días libres que se cruzan con el rango
        const daysOff = await StaffDaysOff.find({
            storeId: normalizedStoreId,
            dateIn: { $lt: new Date(dateOut) },
            dateOut: { $gt: new Date(dateIn) }
        });

        // 3. Obtener los emails de staff con días libres
        const unavailableEmails = new Set(daysOff.map(off => off.staffEmail));

        // 4. Filtrar staff disponibles
        const availableStaff = staffList
            .filter(staff => !unavailableEmails.has(staff.email))
            .map(({ name, email }) => ({ name, email }));

        return res.status(200).json(availableStaff);

    } catch (error) {
        console.error("Error in getStaffAvailable:", error);
        res.status(500).json({ message: "Error checking staff availability", error });
    }
};

export const getStaffDaysOffByEmail = async (req, res) => {
    try {
        //console.log("Entre a getFacilityReservationsByEmail")
        const { email, storeId } = req.params
        //console.log("B: el storeID para getFacilityReservationsByEmail es: ", storeId)
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const staffDaysOffList = await StaffDaysOff.find({ storeId: normalizeStoreID, staffEmail: email });
        //console.log("El listado de Reservation es:", roomReservationList);
        if (!staffDaysOffList) {
            return res.status(200).json({ success: false, message: "Days off not found" });
        }
        res.status(200).json({ success: true, staffDaysOffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getStaffDaysOffByIds = async (req, res) => {
    try {
        //console.log("Entre a roomReservationList")
        const { ids } = req.params;
        const arrayIds = ids.split(",");
        //console.log("B: el ids para roomReservationList es: ", ids)
        const staffDaysOffList = await StaffDaysOff.find({ _id: { $in: arrayIds } });
        //console.log("El listado de Reservation es:", roomReservationList);
        if (!staffDaysOffList) {
            return res.status(200).json({ success: false, message: "Days off not found" });
        }
        res.status(200).json({ success: true, staffDaysOffList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
