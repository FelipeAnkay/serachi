import { Book } from "../models/book.model.js";

/*BOOK FUNCTIONS */
export const createBook = async (req, res) => {
    const { dateIn, dateOut, roomId, storeId, clientName, clientEmail, userId, clientQty } = req.body;
    try {
        if (!clientName || !dateIn || !dateOut || !roomId || !clientEmail || !storeId) {
            throw new Error("All fields are required");
        }

        const book = new Book({
            dateIn,
            dateOut,
            roomId,
            storeId,
            clientName,
            clientEmail,
            userId,
            clientQty
        })

        await book.save();

        res.status(201).json({
            success: true,
            message: "Book created succesfully",
            service: {
                ...book._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateBook = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const book = await Book.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Book updated succesfully",
            service: {
                ...book._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}