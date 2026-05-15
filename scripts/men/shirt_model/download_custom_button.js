const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Button color variants
const fabrics = {
    8: "black",
    6: "blue",
    3: "red",
    1: "white",
};

// Base URL
const BASE_URL = "https://www.hockerty.com/3d/new_man/shirt/STD/Botones";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/men/shirt/shared/buttons"
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
// public/assets/men/shirt/shared/buttons/{fabric_name}/{file}.png

const fileTypes = {
    body_custom_button:
        "front/fit_fit%2Bbutton_close_standard_%2Binside.png",

    neck_custom_button:
        "front/necklines_lady%2Bbutton_close_standard%2Bopen.png",
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
function buildURL(buttonId, filePath) {
    return `${BASE_URL}/${buttonId}/${filePath}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading men shirt custom button assets...\n");

    for (const [buttonId, buttonName] of Object.entries(fabrics)) {

        console.log(`\n🔘 Button Variant: ${buttonName}`);

        const variantFolder = path.join(
            OUTPUT_ROOT,
            buttonName
        );

        await fs.ensureDir(variantFolder);

        let successCount = 0;

        for (const [fileName, filePath] of Object.entries(fileTypes)) {

            const outputPath = path.join(
                variantFolder,
                `${fileName}.png`
            );

            // Skip existing
            if (await fs.pathExists(outputPath)) {
                console.log(`⏭️ Already exists: ${outputPath}`);
                continue;
            }

            const url = buildURL(
                buttonId,
                filePath
            );

            const saved = await downloadImage(
                url,
                outputPath
            );

            if (saved) successCount++;
        }

        console.log(
            `🎉 ${successCount}/${Object.keys(fileTypes).length} files downloaded for ${buttonName}`
        );
    }

    console.log(
        "\n✅ All men shirt custom button downloads completed!"
    );
}

run();