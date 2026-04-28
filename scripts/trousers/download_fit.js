const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Fabric mapping
const fabrics = {
    "2191_fabric": "navy_blue",
    "141_fabric": "iron_gray",
    "3526_fabric": "shiny",
    "2197_fabric": "melange",
    "2192_fabric": "twill",
    "2311_fabric": "cobalt_blue",
    "3879_fabric": "dark_blue",
    "3880_fabric": "sheen",
    "3162_fabric": "busmere",
    "3338_fabric": "gabriel",
    "2078_fabric": "welch",
    "2251_fabric": "delli_colli",
    "2845_fabric": "mcpherson",
    "2284_fabric": "belleville",
    "2682_fabric": "stamper",
};

// Base URL
const BASE = "https://hockerty.com/3d/new_man/pants/STD";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/trousers"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://hockerty.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
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
        console.log(`❌ Error: ${url}`);
        return false;
    }
}

// URL builder
function buildStyleURL(fabricKey) {
    return `${BASE}/${fabricKey}/front/length_long%2Bcut_regular.png`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading trouser style assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        // Folder:
        // public/assets/trousers/{fabric}/style/
        const styleFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        // File:
        // length_long_normal.png
        const filePath = path.join(
            styleFolder,
            "length_long_normal.png"
        );

        // Skip if already exists
        if (await fs.pathExists(filePath)) {
            console.log(`⏭️ Already exists: ${filePath}`);
            continue;
        }

        const url = buildStyleURL(fabricKey);

        await downloadImage(url, filePath);
    }

    console.log("\n✅ All style downloads completed!");
}

run();