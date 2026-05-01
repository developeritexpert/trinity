const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Fabric mapping
const fabrics = {
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
    "3551_fabric": "permose",
    "3553_fabric": "lanterbrid",
    "2985_fabric": "edan",
    "2684_fabric": "yolo",
    "1979_fabric": "blake",
    "1980_fabric": "saddie",
    "2990_fabric": "hartley",
};

// Base URL
const BASE = "https://www.sumissura.com/3d/new_woman/jacket";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/blazer"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// Base asset files
const blazerAssets = {
    hip_pockets:
        "hip_pockets_with_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

    sleeves:
        "sleeves%2Bsleeves_no.png",

    breast_pocket:
        "breast_pocket_yes_style_simple%2Bwide_lapel_standard%2Bstyle_lapel_peak%2Bbuttons_2%2Blength_long.png",

    length_long_body:
        "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_2%2Blength_long%2Bfinishing_straight.png",
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
function buildBlazerURL(fabricKey, fileName) {
    return `${BASE}/${fabricKey}/front/${fileName}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women's blazer base assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        const baseFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "base"
        );

        await fs.ensureDir(baseFolder);

        let successCount = 0;

        for (const [assetName, assetFile] of Object.entries(blazerAssets)) {
            const filePath = path.join(
                baseFolder,
                `${assetName}.png`
            );

            // Skip existing files
            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Already exists: ${filePath}`);
                continue;
            }

            const url = buildBlazerURL(fabricKey, assetFile);

            const saved = await downloadImage(url, filePath);

            if (saved) successCount++;
            else {
                console.log(
                    `⚠️ Failed ${assetName} for fabric: ${fabricName}`
                );
            }
        }

        if (successCount === 0) {
            console.log(
                `⚠️ No new blazer base assets downloaded for ${fabricName}`
            );
        } else {
            console.log(
                `🎉 ${successCount}/4 blazer base assets downloaded`
            );
        }
    }

    console.log(
        "\n✅ All women's blazer base asset downloads completed!"
    );
}

run();