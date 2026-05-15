const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Color variants
const fabrics = {
  50: "black",
  40: "white",
  47: "blue",
  44: "red",
  54: "pink",
  53: "yellow",
};

// Base URL
const BASE_URL = "https://www.hockerty.com/3d/new_man/shirt/STD";

// Output root
const OUTPUT_ROOT = path.resolve(
  process.cwd(),
  "public/assets/men/shirt/shared/holes_threads"
);

// Headers
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  "Referer": "https://www.hockerty.com/",
  "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= FILE CONFIG =================

// Final structure:
// public/assets/men/shirt/shared/holes_threads/{fabric_name}/{file}.png

const fileTypes = {
  // HOLES
  body_hole:
    "Ojales/{id}/front/fit_fit%2Bbutton_close_standard_%2Binside.png",

  neck_hole:
    "Ojales/{id}/front/necklines_open_extreme%2Bbutton_close_standard%2Bopen.png",

  // THREADS
  body_thread:
    "Hilos/{id}/front/fit_fit%2Bbutton_close_standard_%2Binside.png",

  neck_thread:
    "Hilos/{id}/front/necklines_open_extreme%2Bbutton_close_standard%2Bopen.png",
};

// ==========================================

// Download helper
async function downloadImage(url, filepath) {
  try {
    const res = await axios({
      url,
      method: "GET",
      responseType: "stream",
      headers: HEADERS,
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      console.log(`❌ ${res.status}: ${url}`);
      return false;
    }

    const contentType = res.headers["content-type"];
    if (!contentType || !contentType.startsWith("image")) {
      console.log(`⚠️ Not an image: ${url}`);
      return false;
    }

    await fs.ensureDir(path.dirname(filepath));

    const writer = fs.createWriteStream(filepath);
    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        console.log(`✅ Saved: ${filepath}`);
        resolve(true);
      });

      writer.on("error", reject);
    });

  } catch (err) {
    console.log(`❌ Error downloading: ${url}`);
    return false;
  }
}

// URL builder
function buildURL(template, colorId) {
  return `${BASE_URL}/${template.replace("{id}", colorId)}`;
}

// ================= MAIN =================

async function run() {
  console.log("🚀 Downloading men shirt holes + threads assets...\n");

  for (const [colorId, colorName] of Object.entries(fabrics)) {

    console.log(`\n🧵 Variant: ${colorName}`);

    const variantFolder = path.join(
      OUTPUT_ROOT,
      colorName
    );

    await fs.ensureDir(variantFolder);

    let successCount = 0;

    for (const [fileName, fileTemplate] of Object.entries(fileTypes)) {

      const outputPath = path.join(
        variantFolder,
        `${fileName}.png`
      );

      // Skip existing
      if (await fs.pathExists(outputPath)) {
        console.log(`⏭️ Already exists: ${outputPath}`);
        continue;
      }

      const url = buildURL(
        fileTemplate,
        colorId
      );

      const saved = await downloadImage(
        url,
        outputPath
      );

      if (saved) successCount++;
    }

    console.log(
      `🎉 ${successCount}/${Object.keys(fileTypes).length} files downloaded for ${colorName}`
    );
  }

  console.log(
    "\n✅ All men shirt holes + threads downloads completed!"
  );
}

run();