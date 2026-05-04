const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

// Fabric mapping
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

// ================= STYLE CONFIG =================

const jacketStyles = {
    sb_1_button: {
        breast_pocket:
            "breast_pocket_yes_style_simple%2Bwide_lapel_standard%2Bstyle_lapel_peak%2Bbuttons_1%2Blength_long.png",
        length_long_body:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_1%2Blength_long%2Bfinishing_straight.png",
        sb_1_button_shadow:
            "style_simple%2Bstyle_lapel_peak%2Bbuttons_1%2Blength_long.png",
    },

    sb_2_button: {
        bottom:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_2%2Blength_long%2Bfinishing_straight.png",
    },

    sb_3_button: {
        breast_pocket:
            "breast_pocket_yes_style_simple%2Bwide_lapel_standard%2Bstyle_lapel_peak%2Bbuttons_3%2Blength_long.png",
        length_long_body:
            "style_simple%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_3%2Blength_long%2Bfinishing_straight.png",
        sb_3_button_shadow:
            "style_simple%2Bstyle_lapel_peak%2Bbuttons_3%2Blength_long.png",
    },

    db_4_button: {
        breast_pocket:
            "breast_pocket_yes_style_crossed%2Bwide_lapel_standard%2Bstyle_lapel_peak%2Bbuttons_4%2Blength_long.png",
        length_long_body:
            "style_crossed%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_peak%2Bbuttons_4%2Blength_long.png",
        db_4_side_pocket:
            "hip_pockets_with_flap%2Bfit_slim%2Bstyle_crossed%2Blength_long.png",
        db_4_button_shadow:
            "style_crossed%2Bstyle_lapel_peak%2Bbuttons_4.png",
        db_4_base_shadow:
            "style_crossed%2Blength_long.png",
    },

    without_lapel: {
        length_long_body:
            "style_no_flaps%2Bfit_slim%2Bbuttons_2%2Blength_long%2Bfinishing_straight.png",
        wl_2_side_pocket:
            "hip_pockets_with_flap%2Bfit_slim%2Bstyle_simple%2Blength_long.png",
        wl_2_button_shadow:
            "style_no_flaps%2Bbuttons_2%2Blenght_long.png",
        wl_2_base_shadow:
            "style_no_flaps%2Blength_long%2Bfinishing_straight.png",
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
    console.log("🚀 Downloading women jacket style assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        // ✅ MAIN STYLE FOLDER
        const mainStyleFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        await fs.ensureDir(mainStyleFolder);

        for (const [styleFolderName, files] of Object.entries(jacketStyles)) {

            // ✅ CORRECT STRUCTURE:
            // public/assets/trousers/{fabric}/style/{style_variant}/
            const styleFolder = path.join(
                mainStyleFolder,
                styleFolderName
            );

            // ⚠️ Remove old misplaced folder if exists
            const oldMisplacedFolder = path.join(
                OUTPUT_ROOT,
                fabricName,
                styleFolderName
            );

            if (await fs.pathExists(oldMisplacedFolder)) {
                await fs.move(
                    oldMisplacedFolder,
                    styleFolder,
                    { overwrite: true }
                );

                console.log(
                    `📂 Moved misplaced folder into style/: ${styleFolderName}`
                );
            }

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
        "\n✅ All women jacket style assets downloaded!"
    );
}

run();