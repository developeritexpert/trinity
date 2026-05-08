const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    "894_fabric": "navy_blue",
    "3893_fabric": "walnut",
    "141_fabric": "simple_grey",
};

const BASE = "https://www.hockerty.com/3d/new_man/jacket/STD";

const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/men/suits"
);

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.hockerty.com/",
};

// ================= POCKET TYPES =================

const pocketTypes = {
    pockets_double_welt_3_top:
        "front/hip_pockets_double_welt%2Bfit_slim%2Bthird.png",

    pockets_double_welt_3:
        "front/hip_pockets_double_welt%2Bfit_slim.png",

    pockets_double_welt:
        "front/hip_pockets_double_welt%2Bfit_slim.png",

    pockets_patched:
        "front/hip_pockets_patched%2Bfit_slim.png",

    pockets_with_flap_3_top:
        "front/hip_pockets_with_flap%2Bfit_slim%2Bthird.png",

    pockets_with_flap_3:
        "front/hip_pockets_with_flap%2Bfit_slim.png",

    pockets_with_flap:
        "front/hip_pockets_with_flap%2Bfit_slim.png",
};

// ==========================================

// Download helper
async function download(url, filePath) {
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
            return;
        }

        await fs.ensureDir(path.dirname(filePath));

        const writer = fs.createWriteStream(filePath);
        res.data.pipe(writer);

        return new Promise((resolve) => {
            writer.on("finish", () => {
                console.log(`✅ Saved: ${filePath}`);
                resolve();
            });
        });

    } catch (err) {
        console.log(`❌ Error: ${url}`);
    }
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading suit pockets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        const pocketFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "pockets"
        );

        await fs.ensureDir(pocketFolder);

        let count = 0;

        for (const [fileName, pathPart] of Object.entries(pocketTypes)) {

            const filePath = path.join(
                pocketFolder,
                `${fileName}.png`
            );

            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Exists: ${fileName}`);
                continue;
            }

            const url = `${BASE}/${fabricKey}/${pathPart}`;

            await download(url, filePath);
            count++;
        }

        console.log(`🎉 ${count}/${Object.keys(pocketTypes).length} downloaded`);
    }

    console.log("\n✅ All pockets downloaded!");
}

run();