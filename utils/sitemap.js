import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Ad from "../models/Ad.js"; // 🔥 düzəldildi

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }); // 🔥 düzgün istifadə

    let urls = `
    <url>
      <loc>https://proelan.az</loc>
      <priority>1.0</priority>
    </url>
    `;

    ads.forEach((ann) => { // 🔥 düzəldildi
      urls += `
      <url>
        <loc>https://proelan.az/ad/${ann._id}</loc>
        <priority>0.8</priority>
      </url>
      `;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
    </urlset>`;

    fs.writeFileSync(path.join(__dirname, "../public/sitemap.xml"), sitemap);

    console.log("Sayt xəritəsi yaradıldı ✅");
  } catch (err) {
    console.error("Sitemap xətası:", err);
  }
}

export default generateSitemap;