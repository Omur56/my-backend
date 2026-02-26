// import jwt from "jsonwebtoken";
// import User from "../models/user.js";



// const authMiddleware = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "Token yoxdur, giriş et" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // və ya await User.findById(decoded.id)
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Token etibarsızdır" });
//   }
// };

// export default authMiddleware;


import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token yoxdur, giriş et" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // user id əlavə olunur
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token etibarsızdır" });
  }
};

export default authMiddleware;



