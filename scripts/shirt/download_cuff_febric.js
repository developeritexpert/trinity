const fs = require("fs");
const path = require("path");
const axios = require("axios");

const BASE_DIR =
    "C:/Users/Public/Downloads/rahul-office/next-js/next-js+threejs/trinity/public/assets/shirts/shared/contrasted_cuff";

// 🔥 fabrics
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

// 🧠 CUFF TYPES (correct mapping)
const cuffs = [
    { name: "single_1_button", url: "squared" },
    { name: "single_2_button", url: "squared_2_buttons" },
    { name: "two_button_cut", url: "cut_2_buttons" },
    { name: "rounded_1_button", url: "rounded" },
    { name: "double_squared_french", url: "squared_double_french_cuff" },
];

// 🚀 download helper
async function download(url, filePath) {
    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(url, {
        responseType: "stream",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
            Referer: "https://www.hockerty.com/",
        },
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

// 🔥 build URL function
function buildUrl(fabric, type, cuffUrl) {
    return `https://www.hockerty.com/3d/new_man/shirt/STD/${fabric}_fabric/folded/cuff_contrast_${type}%2Bsleeves_long%2Bcuffs_style_${cuffUrl}.png`;
}

// 🚀 MAIN
(async () => {
    for (const fabric of fabrics) {
        const fabricFolder = path.join(BASE_DIR, `ccf_${fabric}`);

        if (!fs.existsSync(fabricFolder)) {
            fs.mkdirSync(fabricFolder, { recursive: true });
        }

        console.log(`\n📁 Processing fabric ${fabric}`);

        for (const cuff of cuffs) {
            // ✅ FULL + INNER correct URLs
            const fullUrl = buildUrl(fabric, "full", cuff.url);
            const innerUrl = buildUrl(fabric, "inner", cuff.url);

            const fullPath = path.join(fabricFolder, `${cuff.name}_cuff_all.png`);
            const innerPath = path.join(
                fabricFolder,
                `${cuff.name}_cuff_inner.png`
            );

            try {
                console.log("⬇️ FULL:", cuff.name);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                await download(fullUrl, fullPath);

                console.log("⬇️ INNER:", cuff.name);
                if (fs.existsSync(innerPath)) fs.unlinkSync(innerPath);
                await download(innerUrl, innerPath);
            } catch (err) {
                console.log("❌ Failed:", cuff.name);
            }
        }
    }

    console.log("\n✅ CUFF DOWNLOAD COMPLETE (FIXED LOGIC)");
})();