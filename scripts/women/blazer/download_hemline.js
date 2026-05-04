const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    "2191_fabric": "navy_blue",
    "141_fabric": "iron_gray",
    "3526_fabric": "shiny",
    "2197_fabric": "melange",
    "2192_fabric": "twill",
    "2311_fabric": "cobalt_blue",
    "3879_fabric": "dark_blue",
    "3880_fabric": "sheen",
    "3162_fabric": "busmere",
    "3338_fabric": "gabriel",
    "2078_fabric": "welch",
    "2251_fabric": "delli_colli",
    "2845_fabric": "mcpherson",
    "2284_fabric": "belleville",
    "2682_fabric": "stamper",
    "3551_fabric": "permose",
    "3553_fabric": "lanterbrid",
    "2985_fabric": "edan",
    "2684_fabric": "yolo",
    "1979_fabric": "blake",
    "1980_fabric": "saddie",
    "2990_fabric": "hartley",
};

// Base URLs
const FABRIC_BASE = "https://www.sumissura.com/3d/new_woman/jacket";
const SHADOW_BASE = "https://www.sumissura.com/3d/new_woman/jacket/sombras";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/blazer"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= VARIANTS =================

const variants = {
    sb_2_button: {
        sb_2_rounded_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_2%2Blength_long%2Bfinishing_rounded.png",
        sb_2_rounded_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_rounded.png",

        sb_2_cutway_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_2%2Blength_long%2Bfinishing_open.png",
        sb_2_cutway_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_open.png",
    },

    sb_1_button: {
        sb_1_rounded_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_1%2Blength_long%2Bfinishing_rounded.png",
        sb_1_rounded_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_rounded.png",

        sb_1_straight_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_1%2Blength_long%2Bfinishing_straight.png",
        sb_1_straight_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_straight.png",

        sb_1_cutway_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_1%2Blength_long%2Bfinishing_open.png",
        sb_1_cutway_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_open.png",
    },

    sb_3_button: {
        sb_3_rounded_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_3%2Blength_long%2Bfinishing_rounded.png",
        sb_3_rounded_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_rounded.png",

        sb_3_straight_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_3%2Blength_long%2Bfinishing_straight.png",
        sb_3_straight_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_straight.png",

        sb_3_cutway_long_length:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_3%2Blength_long%2Bfinishing_open.png",
        sb_3_cutway_base_shadow:
            "style_simple%2Blength_long%2Bfinishing_open.png",
    },

    without_lapel: {
        wl_2_rounded_long_length:
            "style_no_flaps%2Bfit_slim%2Bbuttons_2%2Blength_long%2Bfinishing_rounded.png",
        wl_2_rounded_base_shadow:
            "style_no_flaps%2Blength_long%2Bfinishing_rounded.png",

        wl_2_straight_long_length:
            "style_no_flaps%2Bfit_slim%2Bbuttons_2%2Blength_long%2Bfinishing_straight.png",
        wl_2_straight_base_shadow:
            "style_no_flaps%2Blength_long%2Bfinishing_straight.png",

        wl_2_cutway_long_length:
            "style_no_flaps%2Bfit_slim%2Bbuttons_2%2Blength_long%2Bfinishing_open.png",
        wl_2_cutway_base_shadow:
            "style_no_flaps%2Blength_long%2Bfinishing_open.png",
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

// URL builder
function buildURL(fabricKey, fileName, isShadow = false) {
    if (isShadow) {
        return `${SHADOW_BASE}/front/${fileName}`;
    }

    return `${FABRIC_BASE}/${fabricKey}/front/${fileName}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women jacket finishing variants...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        const mainStyleFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        await fs.ensureDir(mainStyleFolder);

        for (const [styleFolderName, files] of Object.entries(variants)) {

            const styleFolder = path.join(
                mainStyleFolder,
                styleFolderName
            );

            await fs.ensureDir(styleFolder);

            let successCount = 0;

            for (const [fileKey, fileName] of Object.entries(files)) {

                const filePath = path.join(
                    styleFolder,
                    `${fileKey}.png`
                );

                if (await fs.pathExists(filePath)) {
                    console.log(`⏭️ Already exists: ${filePath}`);
                    continue;
                }

                const isShadow = fileKey.includes("shadow");

                const url = buildURL(
                    fabricKey,
                    fileName,
                    isShadow
                );

                const saved = await downloadImage(url, filePath);

                if (saved) successCount++;
            }

            console.log(
                `🎉 ${styleFolderName}: ${successCount} files downloaded`
            );
        }
    }

    console.log(
        "\n✅ All women jacket finishing variants downloaded!"
    );
}

run();