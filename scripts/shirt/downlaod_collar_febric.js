const fs = require("fs");
const path = require("path");
const axios = require("axios");

// 🔥 BASE PATH
const BASE_DIR =
    "C:/Users/Public/Downloads/rahul-office/next-js/next-js+threejs/trinity/public/assets/shirts/shared/contrasted_collar";

// 🧠 CLEAN COLLAR MAP (FINAL TRUTH)
const collars = [
    { name: "new_kent", url: "open" },
    { name: "cutaway", url: "open_extreme" },
    { name: "kent_collar", url: "classic" },
    { name: "button_down", url: "buttons" },
    { name: "stand_up_collar", url: "mao" },
    { name: "rounded_collar", url: "lady" },
];

// 🧠 CONTRAST TYPES
const contrasts = [
    { url: "full", suffix: "collar_all" },
    { url: "inner", suffix: "collar_inner" },
];

// 🚀 DELETE OLD FILES (IMPORTANT STEP)
function cleanFolder(folderPath) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        if (file.includes("collar_all") || file.includes("collar_inner")) {
            fs.unlinkSync(path.join(folderPath, file));
        }
    }
}

// 🚀 DOWNLOAD
async function download(url, filePath) {
    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(url, {
        responseType: "stream",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
            Referer: "https://www.hockerty.com/",
            Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        },
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

// 🚀 MAIN
(async () => {
    const folders = fs.readdirSync(BASE_DIR);

    for (const folder of folders) {
        if (!folder.startsWith("ccf_")) continue;

        const fabricId = folder.split("_")[1];
        const folderPath = path.join(BASE_DIR, folder);

        console.log(`\n📁 CLEANING ${folder}`);

        // 🔥 STEP 1: CLEAN OLD FILES
        cleanFolder(folderPath);

        console.log(`📁 REBUILDING ${folder}`);

        // 🔥 STEP 2: REBUILD FRESH FILES
        for (const c of collars) {
            for (const ct of contrasts) {
                const url = `https://www.hockerty.com/3d/new_man/shirt/STD/${fabricId}_fabric/folded/neck_contrast_${ct.url}%2Bnecklines_${c.url}%2Bnumber_1%2Bbutton_close_standard.png`;

                const fileName = `${c.name}_${ct.suffix}.png`;
                const filePath = path.join(folderPath, fileName);

                try {
                    console.log("⬇️ Downloading:", fileName);

                    await download(url, filePath);
                } catch (err) {
                    console.log("❌ Failed:", fileName);
                }
            }
        }
    }

    console.log("\n✅ CLEAN REBUILD COMPLETE");
})();