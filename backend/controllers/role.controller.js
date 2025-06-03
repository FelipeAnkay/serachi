import  {Role} from "../models/role.model.js"

/* Role FUNCTIONS*/
export const createRole = async (req, res) => {
    const { name, storeId, description, permission, userEmail } = req.body;
    try {
        if (!name || !storeId || !permission || !userEmail) {
            throw new Error("All fields are required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const role = new Role({
            name,
            storeId: normalizeStoreID,
            description,
            permission,
            userEmail
        })

        await role.save();

        res.status(201).json({
            success: true,
            message: "role created succesfully",
            role: {
                ...role._doc,
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateRole = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const role = await Role.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Role updated succesfully",
            Role: {
                ...role._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const removeRole = async (req, res) => {
    const {id} = req.body;
    try {
        console.log("B: Entre a removeRole: ", id)
        if (!id) {
            throw new Error("ID field are required");
        }
        const role = await Role.findByIdAndDelete(id);

        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        res.status(201).json({
            success: true,
            message: "Role updated succesfully",
            role: {
                ...role._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log("B: Llamado a getServiceByID: ", id);
        const role = await Role.findById(id);
        if (!role) {
            return res.status(400).json({ success: false, message: "role not found" });
        }
        res.status(200).json({ success: true, role });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getRolesByStoreId = async (req, res) => {
    try {
        const { storeId } = req.params
        //console.log("B: Llamado a getServiceByID: ", id);
        const normalizeStoreID = storeId?.toUpperCase();
        const roleList = await Role.find({ storeId: normalizeStoreID});
        if (!roleList) {
            return res.status(400).json({ success: false, message: "roleList not found" });
        }
        res.status(200).json({ success: true, roleList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

