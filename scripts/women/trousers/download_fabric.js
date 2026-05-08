const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Only requested fabrics
const fabrics = {
    "2197_fabric": "grey",
    "3338_fabric": "gabriel",
};

// Base URLs
const BASE = "https://www.sumissura.com/3d/new_woman/pants";
const BUTTONS_BASE = "https://www.sumissura.com/3d/new_woman/pants/buttons";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/trouser"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= FILES =================

const baseAssets = {
    length_long:
        "front/length_long%2Bcut_skinny%2Bcrotch_high.png",

    belt_loops:
        "front/front_closure_center_button%2Bbelt_loops_high%2Bcrotch_high.png",

    belt_loops_high:
        "front/belt_loops_high%2Bcrotch_high.png",

    front_pocket_straight:
        "front/front_pocket_straight%2Bcrotch_high.png",

    center_button:
        "3_front_closure_center_button%2Bbelt_loops_high%2Bcrotch_high.png",
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

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women trouser base assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        const baseFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "base"
        );

        await fs.ensureDir(baseFolder);

        let successCount = 0;

        for (const [fileName, filePathPart] of Object.entries(baseAssets)) {

            const filePath = path.join(
                baseFolder,
                `${fileName}.png`
            );

            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Already exists: ${filePath}`);
                continue;
            }

            // Special case for button URL
            const isButton = fileName === "center_button";

            const url = isButton
                ? `${BUTTONS_BASE}/${filePathPart}`
                : `${BASE}/${fabricKey}/${filePathPart}`;

            const saved = await downloadImage(url, filePath);

            if (saved) successCount++;
        }

        console.log(`🎉 ${successCount}/5 files downloaded`);
    }

    console.log("\n✅ All women trouser base assets downloaded!");
}

run();