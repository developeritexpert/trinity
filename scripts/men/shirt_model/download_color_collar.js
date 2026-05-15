const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Add fabric IDs + naming here
const fabrics = {
    "699_fabric": "699",
    "2738_fabric": "2738",
    "3742_fabric": "3742",
    "3747_fabric": "3747",
    // "3812_fabric": "3812",
    // "3813_fabric": "3813",
    // "3783_fabric": "3783",
    // "3811_fabric": "3811",
    // "1769_fabric": "1769",
};

// Base URL
const BASE_URL = "https://www.hockerty.com/3d/new_man/shirt/STD";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/men/shirt/shared/contrasted_collar"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.hockerty.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= CONTRAST COLLAR CONFIG =================

// Final structure:
// public/assets/men/shirt/shared/contrasted_collar/ccf_{fabric}/{file}.png

const collarStyles = {
    // ---------- FULL ----------
    new_kent_collar_all:
        "front/neck_contrast_full%2Bnecklines_open%2Bbutton_close_standard%2Bopen.png",

    cutaway_collar_all:
        "front/neck_contrast_full%2Bnecklines_open_extreme%2Bbutton_close_standard%2Bopen.png",

    kent_collar_collar_all:
        "front/neck_contrast_full%2Bnecklines_classic%2Bbutton_close_standard%2Bopen.png",

    button_down_collar_all:
        "front/neck_contrast_full%2Bnecklines_buttons%2Bbutton_close_standard%2Bopen.png",

    rounded_collar_collar_all:
        "front/neck_contrast_full%2Bnecklines_lady%2Bbutton_close_standard%2Bopen.png",

    stand_up_collar_collar_all:
        "front/neck_contrast_full%2Bnecklines_mao%2Bbutton_close_standard%2Bopen.png",

    // ---------- INNER ----------
    new_kent_collar_inner:
        "front/neck_contrast_inner%2Bnecklines_open%2Bbutton_close_standard%2Bopen.png",

    cutaway_collar_inner:
        "front/neck_contrast_inner%2Bnecklines_open_extreme%2Bbutton_close_standard%2Bopen.png",

    kent_collar_collar_inner:
        "front/neck_contrast_inner%2Bnecklines_classic%2Bbutton_close_standard%2Bopen.png",

    button_down_collar_inner:
        "front/neck_contrast_inner%2Bnecklines_buttons%2Bbutton_close_standard%2Bopen.png",

    rounded_collar_collar_inner:
        "front/neck_contrast_inner%2Bnecklines_lady%2Bbutton_close_standard%2Bopen.png",

    stand_up_collar_collar_inner:
        "front/neck_contrast_inner%2Bnecklines_mao%2Bbutton_close_standard%2Bopen.png",
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
    console.log("🚀 Downloading men shirt contrast collar shared assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        const folderName = `ccf_${fabricName}`;

        console.log(`\n🧵 Contrast Fabric: ${folderName}`);

        // Direct fabric folder (NO style subfolder)
        const fabricFolder = path.join(
            OUTPUT_ROOT,
            folderName
        );

        await fs.ensureDir(fabricFolder);

        let successCount = 0;

        for (const [fileName, filePath] of Object.entries(collarStyles)) {

            const outputPath = path.join(
                fabricFolder,
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
            `🎉 ${successCount}/${Object.keys(collarStyles).length} contrast collar styles downloaded for ${folderName}`
        );
    }

    console.log(
        "\n✅ All men shirt shared contrast collar downloads completed!"
    );
}

run();