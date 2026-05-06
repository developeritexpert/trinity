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

// Pocket styles
const pockets = {
    pocket_1: "pockets_1%2Bpockets_type_peak.png",
    pocket_2: "pockets_2%2Bpockets_type_peak.png",
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

async function run() {
    console.log("🚀 Downloading shirt pocket styles...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {
        console.log(`\n🧵 Fabric: ${fabricName}`);

        const styleFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        await fs.ensureDir(styleFolder);

        let success = 0;

        for (const [name, file] of Object.entries(pockets)) {
            const filePath = path.join(styleFolder, `${name}.png`);

            if (await fs.pathExists(filePath)) {
                console.log("⏭️ Exists:", filePath);
                continue;
            }

            const url = buildURL(fabricKey, file);
            await downloadImage(url, filePath);
            success++;
        }

        console.log(`🎉 ${success}/2 pocket files done`);
    }

    console.log("\n✅ All pocket styles downloaded!");
}

run();