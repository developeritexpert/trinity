const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Fabrics
const fabrics = {
    "3720_fabric": "mid-blue",
    "3212_fabric": "saultmarl",
    "2098_fabric": "vega",
};

// Base URL
const BASE = "https://www.sumissura.com/3d/new_woman/shirt/STD";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/shirt"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// Files to download
const assets = {
    sleeves_long:
        "sleeves_long%2Bcuffs_classic%2Bsleeve_detail_normal.png",

    necklines_classic:
        "necklines_classic%2Bbutton_close_standard.png",

    shirt_base:
        "fit_fit%2Bbutton_close_standard%2Bbottom_cut_modern%2Boutside.png",
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
function buildURL(fabricKey, fileName) {
    return `${BASE}/${fabricKey}/front/${fileName}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women shirt base assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        // Folder:
        // public/assets/women/shirt/{fabric}/base/
        const baseFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "base"
        );

        await fs.ensureDir(baseFolder);

        let successCount = 0;

        for (const [fileKey, fileName] of Object.entries(assets)) {

            const filePath = path.join(
                baseFolder,
                `${fileKey}.png`
            );

            // Skip existing
            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Already exists: ${filePath}`);
                continue;
            }

            const url = buildURL(fabricKey, fileName);

            const saved = await downloadImage(url, filePath);

            if (saved) successCount++;
        }

        console.log(`🎉 ${successCount}/3 files downloaded`);
    }

    console.log("\n✅ All shirt base assets downloaded!");
}

run();