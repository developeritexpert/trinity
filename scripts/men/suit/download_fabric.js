const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= CONFIG =================

const fabrics = {
    // "3893_fabric": "walnut",
    // "141_fabric": "simple_grey",
    "78_fabric": "linen",
    "2855_fabric": "threaded_black",
    "2310_fabric": "striped_blue",
    "3325_fabric": "royal_blue",
    "2192_fabric": "strong_black",
    "2449_fabric": "textured_blue",
    "2456_fabric": "dusty_beige",
    "3707_fabric": "soft_black",
    "2632_fabric": "grey_pinstripe",
};

// Base URLs
const JACKET_BASE = "https://www.hockerty.com/3d/new_man/jacket/STD";
const PANTS_BASE = "https://www.hockerty.com/3d/new_man/pants/STD";

// Output root
const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/men/suits"
);

// Headers
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.hockerty.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= FILES =================

const baseAssets = [
    // -------- JACKET --------
    {
        name: "bottom",
        type: "jacket",
        path: "front/bottom_single_breasted%2Blength_long%2Bhemline_open.png",
    },
    {
        name: "breast_pocket_classic",
        type: "jacket",
        path: "front/breast_pocket_classic.png",
    },
    {
        name: "lapel_notch_standard",
        type: "jacket",
        path: "front/neck_single_breasted%2Bbuttons_1%2Blapel_medium%2Bstyle_lapel_notch.png",
    },
    {
        name: "pockets_with_flap_3",
        type: "jacket",
        path: "front/hip_pockets_with_flap%2Bfit_slim.png",
    },
    {
        name: "sleeves",
        type: "jacket",
        path: "front/sleeves.png",
    },

    // -------- PANTS --------
    {
        name: "pent_button",
        type: "pants",
        path: "front/fastening_moved%2Bvisible_button.png",
    },
    {
        name: "length_long",
        type: "pants",
        path: "front/length_long%2Bcut_slim.png",
    },
    {
        name: "front_pocket",
        type: "pants",
        path: "front/front_pocket%2Bdiagonal.png",
    },
];

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
            console.log(`⚠️ Not image: ${url}`);
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
    console.log("🚀 Downloading men suit FULL base assets...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        const baseFolder = path.join(
            OUTPUT_ROOT,
            fabricName,
            "base"
        );

        await fs.ensureDir(baseFolder);

        let successCount = 0;

        for (const asset of baseAssets) {

            const filePath = path.join(
                baseFolder,
                `${asset.name}.png`
            );

            if (await fs.pathExists(filePath)) {
                console.log(`⏭️ Exists: ${asset.name}`);
                continue;
            }

            const baseURL =
                asset.type === "jacket" ? JACKET_BASE : PANTS_BASE;

            const url = `${baseURL}/${fabricKey}/${asset.path}`;

            const saved = await downloadImage(url, filePath);

            if (saved) successCount++;
        }

        console.log(`🎉 ${successCount}/${baseAssets.length} downloaded`);
    }

    console.log("\n✅ All assets completed!");
}

run();