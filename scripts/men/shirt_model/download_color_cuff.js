const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Fabric IDs
const fabrics = [
    "699",
    "1769",
    "2738",
    "3742",
    "3747",
    "3783",
    "3811",
    "3812",
    "3813",
];

// Base URL
const BASE_URL = "https://www.hockerty.com/3d/new_man/shirt/STD";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/men/shirt/shared/contrasted_cuffs"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.hockerty.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= FILE CONFIG =================

// Final structure:
// public/assets/men/shirt/shared/contrasted_cuffs/ccf_{fabric}/color_cuff_all.png

const FILE_NAME = "color_cuff_all.png";

const FILE_PATH =
    "front/cuff_contrast_outer%2Bsleeves_long%2Bcuffs_classic.png";

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
function buildURL(fabricId) {
    return `${BASE_URL}/${fabricId}_fabric/${FILE_PATH}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading men shirt contrasted outer cuff assets...\n");

    for (const fabricId of fabrics) {

        const folderName = `ccf_${fabricId}`;

        console.log(`\n🧵 Contrast Fabric: ${folderName}`);

        const folderPath = path.join(
            OUTPUT_ROOT,
            folderName
        );

        await fs.ensureDir(folderPath);

        const outputPath = path.join(
            folderPath,
            FILE_NAME
        );

        // Skip existing
        if (await fs.pathExists(outputPath)) {
            console.log(`⏭️ Already exists: ${outputPath}`);
            continue;
        }

        const url = buildURL(fabricId);

        const saved = await downloadImage(
            url,
            outputPath
        );

        if (!saved) {
            console.log(`⚠️ Failed for fabric ${fabricId}`);
        }
    }

    console.log(
        "\n✅ All contrasted outer cuff downloads completed!"
    );
}

run();