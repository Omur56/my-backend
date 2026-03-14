import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const MyAnnouncementSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    images: [String],
    price: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // elan kimə aiddir
      modelName: String, // hansı modeldə yerləşdirilib (clothing, phone, household, homeGarden)
      id: { type: String, required: true, default: () => uuidv4() },
       priorityType: {
  type: String,
  enum: ["free", "vip", "premium"],
  default: "free",
},
priority: {
  type: Number,
  enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
  default: 3,
},
 isActive: { type: Boolean, default: true },
  images: [String],
      category: String,
          brand: String,
          model: String,
          ban_type: String,
          year: String,
          price: String,
          location: String,
      
          images: [String],
          mainImage: String,
          images1: [String],
      
          km: String,
          motor: String,
          transmission: String,
          salon: String,
          barter: String,
          kredit: String,
          engine: String,
          description: String,
      
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
      
          contact: {
            name: String,
            email: String,
            phone: String,
          },
      
          liked: { type: Boolean, default: false },
          favorite: { type: Boolean, default: false },
          data: { type: Date, default: Date.now },
      
          createdAt: { type: Date, default: Date.now },
        },
        { timestamps: true }
      );
      
  


const MyAnnouncement = mongoose.model("MyAnnouncement", MyAnnouncementSchema);
export default MyAnnouncement;