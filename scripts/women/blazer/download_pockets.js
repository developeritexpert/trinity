const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

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
    "3551_fabric": "permose",
    "3553_fabric": "lanterbrid",
    "2985_fabric": "edan",
    "2684_fabric": "yolo",
    "1979_fabric": "blake",
    "1980_fabric": "saddie",
    "2990_fabric": "hartley",
};

// Base URL
const BASE_URL = "https://www.sumissura.com/3d/new_woman/jacket";

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

// ================= STYLE CONFIG =================

// Final structure:
// public/assets/women/blazer/{fabric}/style/{style_variant}/{pocket_type}.png

const stylePocketVariants = {
    // -------- SIMPLE STYLE --------
    sb_1_button: {
        hip_pockets:
            "hip_pockets_with_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        double_welted:
            "hip_pockets_double_live%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        slanted_flap:
            "hip_pockets_diagonal_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",
    },

    sb_2_button: {
        hip_pockets:
            "hip_pockets_with_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        double_welted:
            "hip_pockets_double_live%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        slanted_flap:
            "hip_pockets_diagonal_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",
    },

    sb_3_button: {
        hip_pockets:
            "hip_pockets_with_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        double_welted:
            "hip_pockets_double_live%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        slanted_flap:
            "hip_pockets_diagonal_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",
    },

    without_lapel: {
        hip_pockets:
            "hip_pockets_with_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        double_welted:
            "hip_pockets_double_live%2Bfit_slim%2Bstyle_simple%2Blength_long.png",

        slanted_flap:
            "hip_pockets_diagonal_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",
    },

    // -------- CROSSED STYLE (DB4 ONLY) --------
    db_4_button: {
        hip_pockets:
            "hip_pockets_with_flap%2Bfit_slim%2Bstyle_crossed%2Blength_long.png",

        double_welted:
            "hip_pockets_double_live%2Bfit_slim%2Bstyle_crossed%2Blength_long.png",

        slanted_flap:
            "hip_pockets_diagonal_flap%2Bfit_slim%2Bstyle_crossed%2Blength_long.png",
    },
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
function buildURL(fabricKey, variantFile) {
    return `${BASE_URL}/${fabricKey}/front/${variantFile}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women blazer style pocket variants...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        for (const [styleVariant, pockets] of Object.entries(
            stylePocketVariants
        )) {

            const styleFolder = path.join(
                OUTPUT_ROOT,
                fabricName,
                "style",
                styleVariant
            );

            await fs.ensureDir(styleFolder);

            let successCount = 0;

            for (const [pocketName, variantFile] of Object.entries(
                pockets
            )) {

                const filePath = path.join(
                    styleFolder,
                    `${pocketName}.png`
                );

                // Skip existing
                if (await fs.pathExists(filePath)) {
                    console.log(`⏭️ Already exists: ${filePath}`);
                    continue;
                }

                const url = buildURL(
                    fabricKey,
                    variantFile
                );

                const saved = await downloadImage(
                    url,
                    filePath
                );

                if (saved) successCount++;
            }

            console.log(
                `🎉 ${styleVariant}: ${successCount}/3 pocket variants downloaded`
            );
        }
    }

    console.log(
        "\n✅ All women blazer style pocket downloads completed!"
    );
}

run();