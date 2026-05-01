const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// All sizes
const sizes = [40, 41, 42, 43, 45, 46, 47, 48, 49, 51, 52, 53, 54];

// Valid collars
const collars = {
    new_kent: "open",
    button_down: "buttons",
};

// Fabric name
const fabricName = "holes_threads";

// Base URL
const BASE = "https://hockerty.com/3d/new_man/shirt/STD";

// Output directory (PROJECT ROOT)
const OUTPUT_DIR = path.resolve(
    process.cwd(),
    "public/assets/shirts/shared",
    fabricName
);

// Headers (avoid blocking)
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://hockerty.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ==========================================

// Download function (returns true/false)
async function downloadImage(url, filepath) {
    try {
        const res = await axios({
            url,
            method: "GET",
            responseType: "stream",
            headers: HEADERS,
            validateStatus: () => true,
        });

        // Check HTTP status
        if (res.status !== 200) {
            console.log(`❌ ${res.status}:`, url);
            return false;
        }

        // Ensure it's an image
        const contentType = res.headers["content-type"];
        if (!contentType || !contentType.startsWith("image")) {
            console.log("⚠️ Not an image:", url);
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

// URL builders
function buildSleevesURL(layer, size) {
    return `${BASE}/${layer}/${size}/folded/sleeves_long%2Bcuffs_style_squared.png`;
}

function buildNeckURL(layer, size, type) {
    return `${BASE}/${layer}/${size}/folded/necklines_${type}%2Bnumber_1%2Bbutton_close_standard.png`;
}

function buildBodyURL(layer, size) {
    return `${BASE}/${layer}/${size}/folded/body%2Bbutton_close_standard.png`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Download started...\n");
    console.log("📁 Saving to:", OUTPUT_DIR, "\n");

    for (const [collarName, collarType] of Object.entries(collars)) {
        for (const size of sizes) {

            console.log(`\n⬇️ ${collarName} | size ${size}`);

            const urls = [
                {
                    label: "sleeves_thread",
                    url: buildSleevesURL("Hilos", size),
                    file: `${collarName}_${size}_sleeves_thread.png`,
                },
                {
                    label: "neck_thread",
                    url: buildNeckURL("Hilos", size, collarType),
                    file: `${collarName}_${size}_neck_thread.png`,
                },
                {
                    label: "body_thread",
                    url: buildBodyURL("Hilos", size),
                    file: `${collarName}_${size}_body_thread.png`,
                },
                {
                    label: "sleeves_hole",
                    url: buildSleevesURL("Ojales", size),
                    file: `${collarName}_${size}_sleeves_hole.png`,
                },
                {
                    label: "neck_hole",
                    url: buildNeckURL("Ojales", size, collarType),
                    file: `${collarName}_${size}_neck_hole.png`,
                },
                {
                    label: "body_hole",
                    url: buildBodyURL("Ojales", size),
                    file: `${collarName}_${size}_body_hole.png`,
                },
            ];

            let successCount = 0;

            for (const item of urls) {
                const saved = await downloadImage(
                    item.url,
                    path.join(OUTPUT_DIR, item.file)
                );
                if (saved) successCount++;
            }

            if (successCount === 0) {
                console.log(`⚠️ No assets found for size ${size}`);
            } else {
                console.log(`🎉 ${successCount}/6 assets downloaded`);
            }
        }
    }

    console.log("\n✅ All downloads completed!");
}

run();