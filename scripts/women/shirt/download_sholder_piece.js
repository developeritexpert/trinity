const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    "3404_fabric": "mid-blue",
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

// File
const FILE_NAME = "shoulder_piece_with.png";

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
function buildURL(fabricKey) {
    return `${BASE}/${fabricKey}/front/${FILE_NAME}`;
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading shoulder piece...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        const styleFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        const filePath = path.join(
            styleFolder,
            "shoulder_piece.png"
        );

        // Skip if exists
        if (await fs.pathExists(filePath)) {
            console.log("⏭️ Exists:", filePath);
            continue;
        }

        const url = buildURL(fabricKey);
        await downloadImage(url, filePath);
    }

    console.log("\n✅ Shoulder piece download complete!");
}

run();