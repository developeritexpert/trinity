const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/shirt/shared/buttons"
);

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
};

// ================= BUTTON COLORS =================

// 🔥 IMPORTANT: include button ID here
const buttonColors = {
    white: {
        id: 1,
        url: "https://d1fufvy4xao6k9.cloudfront.net/images/man/shirt/buttons_color/1.jpg",
    },
    red: {
        id: 3,
        url: "https://d1fufvy4xao6k9.cloudfront.net/images/man/shirt/buttons_color/3.jpg",
    },
    blue: {
        id: 6,
        url: "https://d1fufvy4xao6k9.cloudfront.net/images/man/shirt/buttons_color/6.jpg",
    },
    black: {
        id: 8,
        url: "https://d1fufvy4xao6k9.cloudfront.net/images/man/shirt/buttons_color/8.jpg",
    },
};

// ================= BASE =================

const BASE = "https://www.sumissura.com";

// 🔥 use {BTN} placeholder instead of hardcoded 3
const buttonAssets = {
    classic_2_button_collar_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/necklines_classic_2_but_high%2Bbutton_close_standard.png",

    standard_base_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/fit_fit%2Bbutton_close_standard%2Bbottom_cut_modern%2Boutside.png",

    half_fastening_base_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/fit_fit%2Bbutton_close_up_to_half_standard%2Bbottom_cut_modern%2Boutside.png",

    classic_collar_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/necklines_classic%2Bbutton_close_standard.png",

    classic_narrow_collar_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/necklines_classic_low%2Bbutton_close_standard.png",

    rounded_collar_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/necklines_lady%2Bbutton_close_standard.png",

    button_down_collar_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/necklines_buttons%2Bbutton_close_standard.png",

    stand_up_collar_color:
        "/3d/new_woman/shirt/STD/Botones/{BTN}/front/necklines_mao_round_low%2Bbutton_close_standard.png",
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
            return;
        }

        await fs.ensureDir(path.dirname(filepath));

        const writer = fs.createWriteStream(filepath);
        res.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                console.log(`✅ Saved: ${filepath}`);
                resolve();
            });
            writer.on("error", reject);
        });

    } catch (err) {
        console.log(`❌ Error: ${url}`);
    }
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading button assets...\n");

    for (const [colorName, { id, url }] of Object.entries(buttonColors)) {

        console.log(`\n🎨 Color: ${colorName} (Botones/${id})`);

        const colorFolder = path.join(OUTPUT_ROOT, colorName);

        // 1. Button preview image
        await downloadImage(
            url,
            path.join(colorFolder, "button_color.jpg")
        );

        // 2. Overlay assets
        for (const [fileName, templateUrl] of Object.entries(buttonAssets)) {

            // 🔥 replace {BTN} dynamically
            const relativeUrl = templateUrl.replace("{BTN}", id);

            const fullUrl = BASE + relativeUrl;

            await downloadImage(
                fullUrl,
                path.join(colorFolder, `${fileName}.png`)
            );
        }
    }

    console.log("\n✅ All button assets downloaded!");
}

run();