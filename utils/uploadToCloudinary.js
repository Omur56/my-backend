// // utils/uploadToCloudinary.js

// import cloudinary from "cloudinary";

// export const uploadToCloudinary = (buffer) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.v2.uploader.upload_stream(
//       {
//         folder: "proelan",
//         transformation: [
//           { width: 1200, crop: "limit" },
//           { quality: "auto" },
//           { fetch_format: "auto" }
//         ]
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       }
//     ).end(buffer);
//   });
// };
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ düzgün export
export const uploadToCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          {
            overlay: "proelan_watermark",
            width: 0.6,
            opacity: 30,
            gravity: "center",
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};