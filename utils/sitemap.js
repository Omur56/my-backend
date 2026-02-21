import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Announcement from "../models/Announcement.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  const announcements = await Announcement.find().sort({ createdAt: -1 });

  let urls = `
  <url>
    <loc>https://proelan.az</loc>
    <priority>1.0</priority>
  </url>
  `;

  announcements.forEach((ann) => {
    urls += `
    <url>
      <loc>https://proelan.az/announcement/${ann._id}</loc>
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
}

export default generateSitemap;