const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Button color mapping (ID → folder name)
const buttonColors = {
    50: "shiny_gold",
    52: "shilver_brass",
    5: "off_white",
    53: "antique_brass",
    6: "antrazit",
    1: "brown",
    2: "dark_grey",
    51: "gold_brass",
    4: "khakhi",
    3: "navy_blue",
};

// Base URL
const BASE = "https://www.hockerty.com/3d/new_man/jacket/STD/Buttons";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/men/suits/shared/buttons"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.hockerty.com/",
};

// ================= VARIANTS =================

const variants = {
    jacket_mandarin: "front/neck_mao.png",

    jacket_double_breasted_6:
        "front/neck_double_breasted%2Bbuttons_6%2Blapel_wide%2Bstyle_lapel_peak.png",

    jacket_double_breasted_4:
        "front/neck_double_breasted%2Bbuttons_4%2Blapel_wide%2Bstyle_lapel_peak.png",

    jacket_single_breasted_2:
        "front/neck_single_breasted%2Bbuttons_2%2Blapel_wide%2Bstyle_lapel_peak.png",

    jacket_single_breasted:
        "front/neck_single_breasted%2Bbuttons_1%2Blapel_wide%2Bstyle_lapel_peak.png",
};

// ==========================================

// Download helper
async function download(url, filePath) {
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
            return;
        }

        await fs.ensureDir(path.dirname(filePath));

        const writer = fs.createWriteStream(filePath);
        res.data.pipe(writer);

        return new Promise((resolve) => {
            writer.on("finish", () => {
                console.log(`✅ Saved: ${filePath}`);
                resolve();
            });
        });

    } catch (err) {
        console.log(`❌ Error: ${url}`);
    }
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading suit button styles...\n");

    for (const [buttonId, buttonName] of Object.entries(buttonColors)) {

        console.log(`\n🔘 Button: ${buttonName}`);

        for (const [variantName, pathPart] of Object.entries(variants)) {

            const filePath = path.join(
                OUTPUT_ROOT,
                buttonName,
                `${variantName}.png`
            );

            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Exists: ${variantName}`);
                continue;
            }

            const url = `${BASE}/${buttonId}/${pathPart}`;

            await download(url, filePath);
        }
    }

    console.log("\n✅ All button assets downloaded!");
}

run();