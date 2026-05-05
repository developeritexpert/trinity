const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Button IDs
const buttonIds = [
    1, 2, 3, 4, 5, 6,
    50, 51, 52, 53
];

// Base URL
const BASE_URL = "https://www.sumissura.com/3d/new_woman/jacket/buttons";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/blazer/shared/buttons"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= BUTTON VARIANTS =================

const blazerVariants = {
    sb_2_button:
        "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_2%2Blength_long%2Bfinishing_straight.png",

    sb_3_button:
        "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_3%2Blength_long%2Bfinishing_straight.png",

    sb_1_button:
        "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_1%2Blength_long%2Bfinishing_straight.png",

    db_4_button:
        "style_crossed%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_4%2Blength_long.png",

    wl_2_button:
        "style_no_flaps%2Bfit_slim%2Bbuttons_2%2Blength_long%2Bfinishing_straight.png",
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
function buildURL(buttonId, fileName) {
    return `${BASE_URL}/${buttonId}/front/${fileName}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women blazer shared buttons...\n");

    for (const buttonId of buttonIds) {

        console.log(`\n🔘 Button ID: ${buttonId}`);

        // Folder:
        // public/assets/women/blazer/shared/buttons/{buttonId}/
        const buttonFolder = path.join(
            OUTPUT_ROOT,
            String(buttonId)
        );

        await fs.ensureDir(buttonFolder);

        let successCount = 0;

        for (const [variantName, variantFile] of Object.entries(
            blazerVariants
        )) {

            const filePath = path.join(
                buttonFolder,
                `${variantName}.png`
            );

            // Skip existing
            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Already exists: ${filePath}`);
                continue;
            }

            const url = buildURL(
                buttonId,
                variantFile
            );

            const saved = await downloadImage(
                url,
                filePath
            );

            if (saved) successCount++;
        }

        console.log(
            `🎉 ${successCount}/5 button style images downloaded for button ${buttonId}`
        );
    }

    console.log(
        "\n✅ All women blazer shared button downloads completed!"
    );
}

run();