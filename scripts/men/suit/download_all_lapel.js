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

// ================= VARIANTS =================

// Lapel structure (same as before)
const lapelTypes = {
    // ---------- NOTCH ----------
    lapel_notch_standard: {
        mandarin: "front/neck_mao.png",
        single_breasted:
            "front/neck_single_breasted%2Bbuttons_1%2Blapel_medium%2Bstyle_lapel_notch.png",
        single_breasted_2:
            "front/neck_single_breasted%2Bbuttons_2%2Blapel_medium%2Bstyle_lapel_notch.png",
        double_breasted_4:
            "front/neck_double_breasted%2Bbuttons_4%2Blapel_medium%2Bstyle_lapel_notch.png",
        double_breasted_6:
            "front/neck_double_breasted%2Bbuttons_6%2Blapel_medium%2Bstyle_lapel_notch.png",
    },

    lapel_notch_slim: {
        mandarin: "front/neck_mao.png",
        single_breasted:
            "front/neck_single_breasted%2Bbuttons_1%2Blapel_narrow%2Bstyle_lapel_notch.png",
        single_breasted_2:
            "front/neck_single_breasted%2Bbuttons_2%2Blapel_narrow%2Bstyle_lapel_notch.png",
        double_breasted_4:
            "front/neck_double_breasted%2Bbuttons_4%2Blapel_narrow%2Bstyle_lapel_notch.png",
        double_breasted_6:
            "front/neck_double_breasted%2Bbuttons_6%2Blapel_narrow%2Bstyle_lapel_notch.png",
    },

    lapel_notch_wide: {
        mandarin: "front/neck_mao.png",
        single_breasted:
            "front/neck_single_breasted%2Bbuttons_1%2Blapel_wide%2Bstyle_lapel_notch.png",
        single_breasted_2:
            "front/neck_single_breasted%2Bbuttons_2%2Blapel_wide%2Bstyle_lapel_notch.png",
        double_breasted_4:
            "front/neck_double_breasted%2Bbuttons_4%2Blapel_wide%2Bstyle_lapel_notch.png",
        double_breasted_6:
            "front/neck_double_breasted%2Bbuttons_6%2Blapel_wide%2Bstyle_lapel_notch.png",
    },

    // ---------- PEAK ----------
    lapel_peak_standard: {
        mandarin: "front/neck_mao.png",
        single_breasted:
            "front/neck_single_breasted%2Bbuttons_1%2Blapel_medium%2Bstyle_lapel_peak.png",
        single_breasted_2:
            "front/neck_single_breasted%2Bbuttons_2%2Blapel_medium%2Bstyle_lapel_peak.png",
        double_breasted_4:
            "front/neck_double_breasted%2Bbuttons_4%2Blapel_medium%2Bstyle_lapel_peak.png",
        double_breasted_6:
            "front/neck_double_breasted%2Bbuttons_6%2Blapel_medium%2Bstyle_lapel_peak.png",
    },

    lapel_peak_slim: {
        mandarin: "front/neck_mao.png",
        single_breasted:
            "front/neck_single_breasted%2Bbuttons_1%2Blapel_narrow%2Bstyle_lapel_peak.png",
        single_breasted_2:
            "front/neck_single_breasted%2Bbuttons_2%2Blapel_narrow%2Bstyle_lapel_peak.png",
        double_breasted_4:
            "front/neck_double_breasted%2Bbuttons_4%2Blapel_narrow%2Bstyle_lapel_peak.png",
        double_breasted_6:
            "front/neck_double_breasted%2Bbuttons_6%2Blapel_narrow%2Bstyle_lapel_peak.png",
    },

    lapel_peak_wide: {
        mandarin: "front/neck_mao.png",
        single_breasted:
            "front/neck_single_breasted%2Bbuttons_1%2Blapel_wide%2Bstyle_lapel_peak.png",
        single_breasted_2:
            "front/neck_single_breasted%2Bbuttons_2%2Blapel_wide%2Bstyle_lapel_peak.png",
        double_breasted_4:
            "front/neck_double_breasted%2Bbuttons_4%2Blapel_wide%2Bstyle_lapel_peak.png",
        double_breasted_6:
            "front/neck_double_breasted%2Bbuttons_6%2Blapel_wide%2Bstyle_lapel_peak.png",
    },
};

// 🆕 Bottom mapping (NEW)
const bottomVariants = {
    mandarin: "front/bottom_mao%2Blength_long.png",

    single_breasted:
        "front/bottom_single_breasted%2Blength_long%2Bhemline_open.png",

    single_breasted_2:
        "front/bottom_single_breasted%2Blength_long%2Bhemline_open.png",

    double_breasted_4:
        "front/bottom_double_breasted%2Blength_long.png",

    double_breasted_6:
        "front/bottom_double_breasted%2Blength_long.png",
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
            console.log("❌", res.status, url);
            return;
        }

        await fs.ensureDir(path.dirname(filePath));

        const writer = fs.createWriteStream(filePath);
        res.data.pipe(writer);

        return new Promise((resolve) => {
            writer.on("finish", () => {
                console.log("✅", filePath);
                resolve();
            });
        });

    } catch {
        console.log("❌ Error:", url);
    }
}

// ================= MAIN =================

async function run() {
    console.log("🚀 Downloading lapel + bottom styles...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        for (const variant of Object.keys(bottomVariants)) {

            // ---------------- BOTTOM ----------------
            const bottomPath = path.join(
                OUTPUT_ROOT,
                fabricName,
                "style",
                variant,
                "bottom.png"
            );

            if (!(await fs.pathExists(bottomPath))) {
                const url = `${BASE}/${fabricKey}/${bottomVariants[variant]}`;
                await download(url, bottomPath);
            }

            // ---------------- LAPELES ----------------
            for (const [lapelName, variants] of Object.entries(lapelTypes)) {

                const lapelURLPart = variants[variant];

                if (!lapelURLPart) continue;

                const lapelPath = path.join(
                    OUTPUT_ROOT,
                    fabricName,
                    "style",
                    variant,
                    `${lapelName}.png`
                );

                if (await fs.pathExists(lapelPath)) continue;

                const url = `${BASE}/${fabricKey}/${lapelURLPart}`;

                await download(url, lapelPath);
            }
        }
    }

    console.log("\n✅ DONE: Bottom + Lapels downloaded");
}

run();