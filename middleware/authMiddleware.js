import jwt from "jsonwebtoken";
import User from "../models/user.js";

// const authMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "Token yoxdur, giriş et" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Token etibarsızdır" });
//   }
// };


const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token yoxdur, giriş et" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // və ya await User.findById(decoded.id)
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token etibarsızdır" });
  }
};

export default authMiddleware;



