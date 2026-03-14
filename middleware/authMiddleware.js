


// import jwt from "jsonwebtoken";
// import User from "../models/user.js";

// const authMiddleware = async (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "Token yoxdur, giriş et" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: decoded.id }; // user id əlavə olunur
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Token etibarsızdır" });
//   }
// };

// export default authMiddleware;

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ message: "Token yoxdur, giriş et" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // 🔹 buraya JWT-dən decoded id gəlir
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token etibarsızdır" });
  }
};

export default authMiddleware;
