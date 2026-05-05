const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ================= FABRICS =================

const fabrics = {
    // "1802_fabric": "olwein",
    "2191_fabric": "navy_blue",
    "141_fabric": "iron_gray",
    "3526_fabric": "shiny",
    "2197_fabric": "melange",
    "2192_fabric": "twill",
    "2311_fabric": "cobalt_blue",
    "3879_fabric": "dark_blue",
    "3880_fabric": "sheen",
    "3162_fabric": "busmere",
    "3338_fabric": "gabriel", //till this all are done...
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

// ================= URL BASE =================

const FABRIC_BASE = "https://www.sumissura.com/3d/new_woman/jacket";
const SHADOW_BASE = "https://www.sumissura.com/3d/new_woman/jacket/sombras";
const BUTTON_BASE = "https://www.sumissura.com/3d/new_woman/jacket/buttons/3";

// ================= OUTPUT =================

const OUTPUT_ROOT = path.resolve(
    process.cwd(),
    "public/assets/women/blazer"
);

// ================= HEADERS =================

const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Referer": "https://www.sumissura.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
};

// ================= CONFIG GENERATOR =================

const jacketConfigs = {
    sb_1_button: { style: "simple", buttons: 1 },
    sb_2_button: { style: "simple", buttons: 2 },
    sb_3_button: { style: "simple", buttons: 3 },
    db_4_button: { style: "crossed", buttons: 4 },
};

const lapels = {
    notch: "standard",
    peak: "peak",
    shawl: "round",
};

const finishes = {
    rounded: "rounded",
    straight: "straight",
    cutway: "open",
};

// ================= HELPERS =================

function buildFabricURL(
    fabricKey,
    style,
    lapel,
    buttons,
    finish,
    type
) {
    const lapelValue = lapels[lapel];
    const finishValue = finishes[finish];

    if (type === "breast_pocket") {
        return `${FABRIC_BASE}/${fabricKey}/front/breast_pocket_yes_style_${style}%2Bwide_lapel_standard%2Bstyle_lapel_${lapelValue}%2Bbuttons_${buttons}%2Blength_long.png`;
    }

    return `${FABRIC_BASE}/${fabricKey}/front/style_${style}%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_${lapelValue}%2Bbuttons_${buttons}%2Blength_long${style === "simple" ? `%2Bfinishing_${finishValue}` : ""}.png`;
}

function buildButtonURL(style, lapel, buttons, finish) {
    const lapelValue = lapels[lapel];
    const finishValue = finishes[finish];

    return `${BUTTON_BASE}/front/style_${style}%2Bwide_lapel_standard%2Bfit_slim%2Bstyle_lapel_${lapelValue}%2Bbuttons_${buttons}%2Blength_long${style === "simple" ? `%2Bfinishing_${finishValue}` : ""}.png`;
}

function buildShadowURL(style, lapel, buttons, finish) {
    const lapelValue = lapels[lapel];
    const finishValue = finishes[finish];

    if (style === "crossed") {
        return `${SHADOW_BASE}/front/style_crossed%2Bstyle_lapel_${lapelValue}%2Bbuttons_${buttons}.png`;
    }

    if (lapel === "notch" && finish !== "straight") {
        return `${SHADOW_BASE}/front/style_simple%2Blength_long%2Bfinishing_${finishValue}.png`;
    }

    if (finish === "straight" && lapel !== "peak") {
        return `${SHADOW_BASE}/front/style_simple%2Bstyle_lapel_${lapelValue}%2Bbuttons_${buttons}%2Blength_long.png`;
    }

    return `${SHADOW_BASE}/front/style_simple%2Bstyle_lapel_${lapelValue}%2Bbuttons_${buttons}%2Blength_long.png`;
}

// ================= DOWNLOAD =================

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
        if (!contentType?.startsWith("image")) {
            console.log(`⚠️ Invalid image: ${url}`);
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
    console.log("🚀 Downloading complete blazer style system...\n");

    for (const [fabricKey, fabricName] of Object.entries(fabrics)) {

        console.log(`\n🧵 Fabric: ${fabricName}`);

        for (const [folderName, config] of Object.entries(jacketConfigs)) {

            const styleFolder = path.join(
                OUTPUT_ROOT,
                fabricName,
                "style",
                folderName
            );

            await fs.ensureDir(styleFolder);

            for (const lapel of Object.keys(lapels)) {
                for (const finish of Object.keys(finishes)) {

                    // DB_4 doesn't really vary by finish visually,
                    // but still generating full structure
                    const prefix = `${folderName.replace(
                        "_button",
                        ""
                    )}_${finish}_${lapel}`;

                    const files = {
                        [`${prefix}_breast_pocket`]:
                            buildFabricURL(
                                fabricKey,
                                config.style,
                                lapel,
                                config.buttons,
                                finish,
                                "breast_pocket"
                            ),

                        [`${prefix}_length_long`]:
                            buildFabricURL(
                                fabricKey,
                                config.style,
                                lapel,
                                config.buttons,
                                finish,
                                "body"
                            ),

                        [`${prefix}_button`]:
                            buildButtonURL(
                                config.style,
                                lapel,
                                config.buttons,
                                finish
                            ),

                        [`${prefix}_shadow`]:
                            buildShadowURL(
                                config.style,
                                lapel,
                                config.buttons,
                                finish
                            ),
                    };

                    for (const [fileName, url] of Object.entries(files)) {

                        const filePath = path.join(
                            styleFolder,
                            `${fileName}.png`
                        );

                        if (await fs.pathExists(filePath)) {
                            continue;
                        }

                        await downloadImage(url, filePath);
                    }
                }
            }
        }
    }

    console.log(
        "\n✅ Complete women blazer system downloaded!"
    );
}

run();