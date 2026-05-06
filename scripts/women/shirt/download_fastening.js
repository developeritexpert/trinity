const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    "3720_fabric": "mid-blue",
    "3212_fabric": "saultmarl",
    "2098_fabric": "vega",
};

const BASE = "https://www.sumissura.com/3d/new_woman/shirt/STD";

const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/shirt"
);

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
};

// ================= CONFIG DATA =================

// ✅ hidden button
const hiddenButton = {
    base:
        "fit_fit%2Bbutton_close_hidden%2Bbottom_cut_modern%2Boutside.png",

    collars: {
        classic_collar:
            "necklines_classic%2Bbutton_close_hidden.png",

        classic_2_button_collar:
            "necklines_classic_2_but_high%2Bbutton_close_hidden.png",

        classic_narrow_collar:
            "necklines_classic_low%2Bbutton_close_hidden.png",

        rounded_collar:
            "necklines_lady%2Bbutton_close_hidden.png",

        button_down_collar:
            "necklines_buttons%2Bbutton_close_hidden.png",

        stand_up_collar:
            "necklines_mao_round_low%2Bbutton_close_hidden.png",
    },
};

// ✅ half fastening
const halfFastening = {
    base:
        "fit_fit%2Bbutton_close_up_to_half_standard%2Bbottom_cut_modern%2Boutside.png",

    collars: {
        classic_collar:
            "necklines_classic%2Bbutton_close_standard.png",

        classic_2_button_collar:
            "necklines_classic_2_but_high%2Bbutton_close_standard.png",

        classic_narrow_collar:
            "necklines_classic_low%2Bbutton_close_standard.png",

        rounded_collar:
            "necklines_lady%2Bbutton_close_standard.png",

        button_down_collar:
            "necklines_buttons%2Bbutton_close_standard.png",

        stand_up_collar:
            "necklines_mao_round_low%2Bbutton_close_standard.png",
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
            return;
        }

        await fs.ensureDir(path.dirname(filepath));

        const writer = fs.createWriteStream(filepath);
        res.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                console.log("✅ Saved:", filepath);
                resolve();
            });
            writer.on("error", reject);
        });

    } catch (err) {
        console.log("❌ Error:", url);
    }
}

// URL builder
function buildURL(fabricKey, fileName) {
    return `${BASE}/${fabricKey}/front/${fileName}`;
}

// ================= MAIN =================

async function processType(typeName, config, fabricKey, fabricName) {

    const folder = path.join(
        OUTPUT_ROOT,
        fabricName,
        "style",
        typeName
    );

    await fs.ensureDir(folder);

    // ✅ Download base ONLY ONCE
    const basePath = path.join(folder, "shirt_base.png");

    if (!(await fs.pathExists(basePath))) {
        const baseURL = buildURL(fabricKey, config.base);
        await downloadImage(baseURL, basePath);
    } else {
        console.log("⏭️ Base exists:", basePath);
    }

    // ✅ Download collars
    for (const [name, file] of Object.entries(config.collars)) {
        const filePath = path.join(folder, `${name}.png`);

        if (await fs.pathExists(filePath)) {
            console.log("⏭️ Exists:", filePath);
            continue;
        }

        const url = buildURL(fabricKey, file);
        await downloadImage(url, filePath);
    }
}

// ================= RUN =================

async function run() {
    console.log("🚀 Downloading shirt variants...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        await processType("hidden_button", hiddenButton, fabricKey, fabricName);
        await processType("half_fastening", halfFastening, fabricKey, fabricName);
    }

    console.log("\n✅ Done!");
}

run();