const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Add or expand fabrics anytime
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

// ================= STYLE CONFIG =================

// Structure:
// public/assets/women/trouser/{fabric}/style/{fit_type}/{file}.png

const fitStyles = {
    slim_fit: {
        length_long_slim:
            "front/length_long%2Bcut_skinny%2Bcrotch_high.png",

        length_ankle_slim:
            "front/length_ankle%2Bcut_skinny%2Bcrotch_high.png",

        length_bermuda_slim:
            "front/length_bermuda%2Bcut_skinny%2Bcrotch_high.png",
    },

    wide_fit: {
        length_long_wide:
            "front/length_long%2Bcut_loose%2Bcrotch_high.png",

        length_ankle_wide:
            "front/length_ankle%2Bcut_loose%2Bcrotch_high.png",

        length_bermuda_wide:
            "front/length_bermuda%2Bcut_loose%2Bcrotch_high.png",
    },

    regular_fit: {
        length_long_regular:
            "front/length_long%2Bcut_standard%2Bcrotch_high.png",

        length_ankle_regular:
            "front/length_ankle%2Bcut_standard%2Bcrotch_high.png",

        length_bermuda_regular:
            "front/length_bermuda%2Bcut_standard%2Bcrotch_high.png",
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
    console.log("🚀 Downloading women trouser fit styles...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        const mainStyleFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        await fs.ensureDir(mainStyleFolder);

        for (const [fitFolderName, files] of Object.entries(fitStyles)) {

            const fitFolder = path.join(
                mainStyleFolder,
                fitFolderName
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
                `🎉 ${fitFolderName}: ${successCount}/${Object.keys(files).length} downloaded`
            );
        }
    }

    console.log(
        "\n✅ All women trouser fit style assets downloaded!"
    );
}

run();