const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Add more fabrics here anytime
const fabrics = {
    "3048_fabric": "apple_red",
    // "1871_fabric": "white",
    // "xxxx_fabric": "fabric_name",
};

// Base URL
const BASE_URL = "https://www.hockerty.com/3d/new_man/shirt/STD";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/men/shirt"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.hockerty.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= BASE FILES =================

// Final structure:
// public/assets/men/shirt/{fabric_name}/base/{file}.png

const baseFiles = {
    neckline:
        "front/necklines_open_extreme%2Bbutton_close_standard%2Bopen.png",

    sleeves:
        "front/sleeves_long%2Bcuffs_classic.png",

    body:
        "front/fit_fit%2Bbutton_close_standard%2Binside.png",
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
function buildURL(fabricKey, filePath) {
    return `${BASE_URL}/${fabricKey}/${filePath}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading men shirt base assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        const baseFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "base"
        );

        await fs.ensureDir(baseFolder);

        let successCount = 0;

        for (const [fileName, filePath] of Object.entries(baseFiles)) {

            const outputPath = path.join(
                baseFolder,
                `${fileName}.png`
            );

            // Skip existing files
            if (await fs.pathExists(outputPath)) {
                console.log(`⏭️ Already exists: ${outputPath}`);
                continue;
            }

            const url = buildURL(
                fabricKey,
                filePath
            );

            const saved = await downloadImage(
                url,
                outputPath
            );

            if (saved) successCount++;
        }

        console.log(
            `🎉 ${successCount}/${Object.keys(baseFiles).length} base assets downloaded for ${fabricName}`
        );
    }

    console.log(
        "\n✅ All men shirt base downloads completed!"
    );
}

run();