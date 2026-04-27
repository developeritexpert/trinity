const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const BASE = 'https://hockerty.com/3d/new_man/shirt/STD';
const OUT = path.resolve(process.cwd(), 'public/assets/shirts/shared/holes_threads');
const HEADERS = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://hockerty.com/' };
const collars = { new_kent: 'open', button_down: 'buttons' };
const missingCodes = [44, 50]; // Beige=44, Dark Brown=50

async function dl(url, file) {
    try {
        const res = await axios({ url, method: 'GET', responseType: 'stream', headers: HEADERS, validateStatus: () => true });
        if (res.status !== 200) { console.log('FAIL', res.status, url); return; }
        await fs.ensureDir(path.dirname(file));
        const w = fs.createWriteStream(file);
        res.data.pipe(w);
        return new Promise(r => w.on('finish', () => { console.log('✅', path.basename(file)); r(); }));
    } catch(e) {
        console.log('ERROR', url);
    }
}

async function run() {
    for (const [collar, type] of Object.entries(collars)) {
        for (const code of missingCodes) {
            console.log('\n⬇️', collar, '| code', code);
            await dl(BASE + '/Hilos/' + code + '/folded/sleeves_long%2Bcuffs_style_squared.png', OUT + '/' + collar + '_' + code + '_sleeves_thread.png');
            await dl(BASE + '/Hilos/' + code + '/folded/necklines_' + type + '%2Bnumber_1%2Bbutton_close_standard.png', OUT + '/' + collar + '_' + code + '_neck_thread.png');
            await dl(BASE + '/Hilos/' + code + '/folded/body%2Bbutton_close_standard.png', OUT + '/' + collar + '_' + code + '_body_thread.png');
            await dl(BASE + '/Ojales/' + code + '/folded/sleeves_long%2Bcuffs_style_squared.png', OUT + '/' + collar + '_' + code + '_sleeves_hole.png');
            await dl(BASE + '/Ojales/' + code + '/folded/necklines_' + type + '%2Bnumber_1%2Bbutton_close_standard.png', OUT + '/' + collar + '_' + code + '_neck_hole.png');
            await dl(BASE + '/Ojales/' + code + '/folded/body%2Bbutton_close_standard.png', OUT + '/' + collar + '_' + code + '_body_hole.png');
        }
    }
    console.log('\n✅ Done');
}
run();
