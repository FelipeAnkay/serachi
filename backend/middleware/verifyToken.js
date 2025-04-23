import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    //console.log("Start of VerifyToken function");
    const token = req.cookies.token;
    //console.log("VerifyToken function: ", token);
    if (!token){
        return res.status(401).json({sucess: false, message: "Unauthorized - No token provided"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({sucess: false, message: "Unauthorized - No token provided"});
        }
        req.userId = decoded.userId;
        //console.log("Accessing to Next(): ", req.userId);
        next();
    } catch (error) {

        return res.status(500).json({sucess: false, message: "Server Error"});
    }
}