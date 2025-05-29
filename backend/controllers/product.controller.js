import { Product } from "../models/product.model.js";

/*Product FUNCTIONS */
export const createProduct = async (req, res) => {
    const { name, price, tax, finalPrice,currency, type, userId, storeId, durationDays } = req.body;
    try {
        if (!name || !price || !type || !storeId || !currency) {
            throw new Error("All fields are required");
        }

        const normalizeStoreID = storeId?.toUpperCase();

        const product = new Product({
            name,
            price,
            tax,
            finalPrice,
            currency,
            type,
            userId,
            durationDays,
            storeId: normalizeStoreID
        })

        await product.save();

        res.status(201).json({
            success: true,
            message: "product created succesfully",
            service: {
                ...product._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const productList = async (req, res) => {
    try {
        const {storeId} = req.params
        //console.log("B: Entre a ProductList:", storeId);
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const productList = await Product.find({storeId: normalizeStoreID});
        //console.log("El listado de productos es:", productList);
        if (!productList) {
            return res.status(400).json({ success: false, message: "Products not found" });
        }
        res.status(200).json({ success: true, productList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getProductById = async (req, res) => {
    try {
        const {id} = req.params;
        console.log("Llamando a Product.findById: ", id);
        const product = await Product.findById(id);
        console.log("La respuesta es: ", product);
        if (!product) {
            return res.status(400).json({ success: false, message: "product not found" });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const getProductByIds = async (req, res) => {
    try {
        const { ids } = req.params;
        const arrayIds = ids.split(",");
        const productList = await Product.find({ _id: { $in: arrayIds } });
        if (!productList) {
            return res.status(400).json({ success: false, message: "productList not found" });
        }
        res.status(200).json({ success: true, productList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
export const updateProduct = async (req, res) => {
    const { id, ...updateFields } = req.body;
    try {
        if (!id) {
            throw new Error("Id field is required");
        }

        const product = await Product.findByIdAndUpdate(id, updateFields, {
            new: true
        });

        res.status(201).json({
            success: true,
            message: "Product updated succesfully",
            service: {
                ...product._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const removeProduct = async (req, res) => {
    const {id} = req.body;
    try {
        console.log("B: Entre a removeProduct: ", id)
        if (!id) {
            throw new Error("ID field are required");
        }
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        product.isActive = false;
        await product.save();

        res.status(201).json({
            success: true,
            message: "Staff updated succesfully",
            service: {
                ...product._doc
            }
        })

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
export const getProductByType = async (req, res) => {
    try {
        const {storeId, type} = req.params
        //console.log("B: Entre a productList:", storeId);
        if (!storeId) {
            throw new Error("StoreID is required");
        }
        const normalizeStoreID = storeId?.toUpperCase();
        const productList = await Product.find({storeId: normalizeStoreID, type: type});
        //console.log("El listado de product es:", productList);
        if (!productList) {
            return res.status(400).json({ success: false, message: "product not found" });
        }
        res.status(200).json({ success: true, productList });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}
