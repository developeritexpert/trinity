const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    "3404_fabric": "miles",
    "2608_fabric": "marie",
    "3910_fabric": "baco",
    "2601_fabric": "naya",
    "3908_fabric": "perla",
};

// Base URL (fabricKey will be injected)
const BASE = "https://www.sumissura.com/3d/new_woman/shirt/STD";

// Output folder
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/shirt/shared/coller"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
};

// ================= COLLAR MAP =================

const collars = {
    stand_up_coller_customized:
        "neck_contrast_full_necklines_mao_round_low.png",

    button_down_customized:
        "neck_contrast_full_necklines_buttons.png",

    rounded_customized:
        "neck_contrast_full_necklines_lady.png",

    classic_narrow_customized:
        "neck_contrast_full_necklines_classic_low.png",

    classic_2_button_customized:
        "neck_contrast_full_necklines_classic_2_but_high.png",

    classic_customized:
        "neck_contrast_full_necklines_classic.png",
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

        await fs.ensureDir(path.dirname(filepath));

        const writer = fs.createWriteStream(filepath);
        res.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                console.log("✅ Saved:", filepath);
                resolve(true);
            });
            writer.on("error", reject);
        });

    } catch (err) {
        console.log("❌ Error:", url);
        return false;
    }
}

// URL builder
function buildURL(fabricKey, fileName) {
    return `${BASE}/${fabricKey}/front/${fileName}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading customized collars (per fabric)...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        const fabricFolder = path.join(
            OUTPUT_ROOT,
            fabricName
        );

        await fs.ensureDir(fabricFolder);

        let success = 0;

        for (const [name, file] of Object.entries(collars)) {

            const filePath = path.join(
                fabricFolder,
                `${name}.png`
            );

            // Skip existing
            if (await fs.pathExists(filePath)) {
                console.log("⏭️ Exists:", filePath);
                continue;
            }

            const url = buildURL(fabricKey, file);

            const saved = await downloadImage(url, filePath);

            if (saved) success++;
        }

        console.log(`🎉 ${success}/6 collars downloaded`);
    }

    console.log("\n✅ All customized collars downloaded!");
}

run();