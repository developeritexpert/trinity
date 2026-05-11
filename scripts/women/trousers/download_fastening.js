const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    "894_fabric": "navy_blue",
    "2197_fabric": "grey",
    "3338_fabric": "gabriel",
};

// Base URL
const BASE = "https://www.sumissura.com/3d/new_woman/pants";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/trouser"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= STYLE FILES =================

// Final structure:
// public/assets/women/trouser/{fabric}/style/{file}.png

const closureStyles = {
    center_button:
        "front/front_closure_center_button%2Bbelt_loops_high%2Bcrotch_high.png",

    side_zipper:
        "front/front_closure_side_zipper%2Bbelt_loops_high%2Bcrotch_high.png",

    off_center:
        "front/front_closure_moved_button%2Bbelt_loops_high%2Bcrotch_high.png",
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

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading women trouser closure styles...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        const styleFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "style"
        );

        await fs.ensureDir(styleFolder);

        let successCount = 0;

        for (const [fileName, filePathPart] of Object.entries(closureStyles)) {

            const filePath = path.join(
                styleFolder,
                `${fileName}.png`
            );

            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Already exists: ${filePath}`);
                continue;
            }

            const url = `${BASE}/${fabricKey}/${filePathPart}`;

            const saved = await downloadImage(url, filePath);

            if (saved) successCount++;
        }

        console.log(
            `🎉 ${successCount}/${Object.keys(closureStyles).length} downloaded`
        );
    }

    console.log(
        "\n✅ All women trouser closure style assets downloaded!"
    );
}

run();