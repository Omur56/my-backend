

// import authMiddleware from "../middleware/auth.js"; // token yoxlayan middleware
// import Car from "../models/Car.js";
// import RealEstate from "../models/RealEstate.js";
// import HomeAndGarden from "../models/HomeAndGarden.js";
// import Clothing from "../models/Clothing.js";
// import Announcement from "../models/Announcement.js";
// import Electronika from "../models/Electronika.js";
// import Household from "../models/Household.js";
// import Phone from "../models/Phone.js";
// import Acsesuar from "../models/Acsesuar.js";

// // kateqoriya-mapping
// const modelsMap = {
//   cars: Car,
//   realEstate: RealEstate,
//   homeAndGarden: HomeAndGarden,
//   Clothing: Clothing,
//   Announcement: Announcement,
//   Electronika: Electronika,
//   Household: Household,
//   Phone: Phone,
//   Acsesuar: Acsesuar
// };

// // GET /api/my-{category} - istifadəçinin bütün elanları
// app.get("/my-:category", authMiddleware, async (req, res) => {
//   try {
//     const category = req.params.category;
//     const Model = modelsMap[category];
//     if (!Model) return res.status(400).json({ message: "Invalid category" });

//     const ads = await Model.find({ user: req.user.id }).sort({ createdAt: -1 });
//     res.json(ads);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // DELETE /api/{category}/{id} - istifadəçi öz elanını silir
// app.delete("/:category/:id", authMiddleware, async (req, res) => {
//   try {
//     const { category, id } = req.params;
//     const Model = modelsMap[category];
//     if (!Model) return res.status(400).json({ message: "Invalid category" });

//     const ad = await Model.findById(id);
//     if (!ad) return res.status(404).json({ message: "Ad not found" });

//     // Yalnız sahibi silə bilər
//     if (ad.user.toString() !== req.user.id)
//       return res.status(403).json({ message: "Not authorized" });

//     await Model.findByIdAndDelete(id);
//     res.json({ message: "Ad deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// export default app;
