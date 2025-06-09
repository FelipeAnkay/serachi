import { Form } from "../models/form.model.js";
import { sendFormEmail } from "../mailtrap/emails.js";
import crypto from 'node:crypto';

/*BOOK FUNCTIONS */
export const createForm = async (req, res) => {
    const { name, url, storeId } = req.body;
    try {
        if (!name || !url || !storeId) {
            throw new Error("All fields are required");
        }

        const normalizedStoreId = storeId?.toUpperCase();

        const form = new Form({
            name,
            url,
            storeId: normalizedStoreId
        })

        await form.save();

        res.status(201).json({
            success: true,
            message: "Form created succesfully",
            form: {
                ...form._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateForm = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const form = await Form.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Form updated succesfully",
            form: {
                ...Form._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getFormById = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log("B: Llamado a getServiceByID: ", id);
        const form = await Form.findById(id);
        if (!form) {
            return res.status(400).json({ success: false, message: "form not found" });
        }
        res.status(200).json({ success: true, form });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getFormsByStoreId = async (req, res) => {
    try {
        const { storeId } = req.params
        //console.log("B: Llamado a getServiceByID: ", id);
        const normalizeStoreID = storeId?.toUpperCase();
        const formList = await Form.find({ storeId: normalizeStoreID });
        if (!formList) {
            return res.status(400).json({ success: false, message: "formList not found" });
        }
        res.status(200).json({ success: true, formList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const getUrlToken = async (req, res) => {
    const ENCRYPTION_KEY = crypto.createHash('sha256').update('GENERADOR_URL_2025').digest(); // 32 bytes para AES-256
    const IV_LENGTH = 16;
    try {
        const { email, storeId } = req.params;
        if (!email || !storeId) throw new Error("Missing email or storeId");

        const payload = JSON.stringify({ email, storeId });

        // Crear IV aleatorio
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

        let encrypted = cipher.update(payload, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Concatenar IV y texto cifrado
        const token = Buffer.from(iv.toString('base64') + ':' + encrypted).toString('base64');

        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getTokenData = async (req, res) => {
    const ENCRYPTION_KEY = crypto.createHash('sha256').update('GENERADOR_URL_2025').digest(); // 32 bytes para AES-256
    const IV_LENGTH = 16;
    try {
        const { urlToken } = req.params;

        // Paso 1: decodificar el base64 externo
        const decoded = Buffer.from(urlToken, 'base64').toString(); // "iv:encrypted"
        const [ivB64, encrypted] = decoded.split(':');

        if (!ivB64 || !encrypted) {
            throw new Error('Invalid token format');
        }

        // Paso 2: preparar el decipher
        const iv = Buffer.from(ivB64, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

        // Paso 3: desencriptar
        let decrypted = decipher.update(encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        const { email: customerEmail, storeId } = JSON.parse(decrypted);

        const urlData = {
            customerEmail,
            storeId,
        };

        res.status(200).json({ success: true, urlData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const postFormEmail = async (req, res) => {
    try {
        const { customer, user, store, formList, urlToken } = req.body;
        console.log("postFormEmail variables:", {
            customer,
            user,
            store,
            formList,
            urlToken
        });
        const mailSent = await sendFormEmail(customer.email, customer.name, formList, user.email, user.name, store.name, urlToken);
        console.log("Respuesta de sendFormEmail: ", mailSent)
        res.status(200).json({ success: true, mailSent});
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}