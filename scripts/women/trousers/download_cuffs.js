const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    "894_fabric": "navy_blue",
    "2197_fabric": "grey",
    "3338_fabric": "gabriel",
};

// Base URL
const BASE = "https://www.sumissura.com/3d/new_woman/pants";

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

// ================= CUFF STYLE CONFIG =================

// Final structure:
// public/assets/women/trouser/{fabric}/style/{fit_type}/{file}.png

const cuffStyles = {
    regular_fit: {
        length_long_regular_cuff:
            "front/cuff_standard%2Blength_long%2Bcut_standard.png",

        length_ankle_regular_cuff:
            "front/cuff_standard%2Blength_ankle%2Bcut_standard.png",

        length_bermuda_regular_cuff:
            "front/cuff_standard%2Blength_bermuda%2Bcut_standard.png",
    },

    slim_fit: {
        length_long_slim_cuff:
            "front/cuff_standard%2Blength_long%2Bcut_skinny.png",

        length_ankle_slim_cuff:
            "front/cuff_standard%2Blength_ankle%2Bcut_skinny.png",

        length_bermuda_slim_cuff:
            "front/cuff_standard%2Blength_bermuda%2Bcut_skinny.png",
    },

    wide_fit: {
        length_long_wide_cuff:
            "front/cuff_standard%2Blength_long%2Bcut_loose.png",

        length_ankle_wide_cuff:
            "front/cuff_standard%2Blength_ankle%2Bcut_loose.png",

        length_bermuda_wide_cuff:
            "front/cuff_standard%2Blength_bermuda%2Bcut_loose.png",
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
        console.log(`❌ Error: ${url}`);
        return false;
    }
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women trouser cuff styles...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        const styleRoot = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        await fs.ensureDir(styleRoot);

        for (const [fitType, files] of Object.entries(cuffStyles)) {

            const fitFolder = path.join(
                styleRoot,
                fitType
            );

            await fs.ensureDir(fitFolder);

            let successCount = 0;

            for (const [fileName, filePathPart] of Object.entries(files)) {

                const filePath = path.join(
                    fitFolder,
                    `${fileName}.png`
                );

                if (await fs.pathExists(filePath)) {
                    console.log(`⏭️ Already exists: ${filePath}`);
                    continue;
                }

                const url = `${BASE}/${fabricKey}/${filePathPart}`;

                const saved = await downloadImage(url, filePath);

                if (saved) successCount++;
            }

            console.log(
                `🎉 ${fitType}: ${successCount}/${Object.keys(files).length} downloaded`
            );
        }
    }

    console.log(
        "\n✅ All women trouser cuff style assets downloaded!"
    );
}

run();