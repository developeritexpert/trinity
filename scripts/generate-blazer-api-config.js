/**
 * Generates men-blazer-api.json by merging:
 *  - Live Shopify options API (all option groups + swatch images)
 *  - Existing men-blazer.json visual asset mappings (preserved 1:1)
 *  - New API-only option groups added as order-form fields (no assets yet)
 *
 * Run: node scripts/generate-blazer-api-config.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL =
  'https://options.shopapps.site/v2/trinityclothiers.myshopify.com/generate_option/8629892369?tmp=1778738748';

const OUT_FILE = path.join(__dirname, '../src/core/config/men-blazer-api.json');

// ─── Existing asset maps from men-blazer.json (kept 1:1) ─────────────────────
// We preserve all visual assets exactly as they are in the original file.
const existingBlazer = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../src/core/config/men-blazer.json'),
    'utf8'
  )
);

/** Build a lookup: attributeId -> attribute object (from existing JSON) */
function buildExistingLookup() {
  const map = {};
  for (const attr of existingBlazer.attributes) {
    map[attr.id] = attr;
  }
  return map;
}

// ─── API fetch helper ─────────────────────────────────────────────────────────
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse API JSON: ' + e.message));
        }
      });
    }).on('error', reject);
  });
}

// ─── Slug helper ─────────────────────────────────────────────────────────────
function slug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// ─── Map API type → configurator displayType ─────────────────────────────────
function mapDisplayType(apiType) {
  switch (apiType) {
    case 'swatch': return 'swatch';
    case 'textbox': return 'text';
    case 'dropdown': return 'dropdown';
    case 'radio': return 'radio';
    case 'displaytext': return 'info';
    default: return 'icon';
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching Shopify API…');
  const apiData = await fetchJson(API_URL);

  // API structure: option_product.option_sets[0].options[] contains all option groups
  const topLevelSets = apiData?.option_product?.option_sets ?? [];
  if (!topLevelSets.length) throw new Error('No option_sets found in API response');
  // All individual option groups live inside the first set's .options array
  const optionSets = topLevelSets[0]?.options ?? [];

  const existing = buildExistingLookup();

  // ─── Asset maps: API internal_name → existing attribute id ────────────────
  // We link each API group to the matching existing attribute so we can copy assets.
  const API_TO_EXISTING_ID = {
    'Premium Fabric':                             'fabric',
    'Style':                                       'style',
    'Design Your Jacket':                          'lapel_width',   // lapel_width, pocket_style share this
    'Jacket Lining*':                              null,            // new – no assets yet
    'DESIGN YOUR JACKET':                          null,            // group label – handled per-option
    'Vent Style':                                  'vent_style',
    'Cuff Button ':                                'cuff_button',
    'Cuff Button':                                 'cuff_button',
    'Jacket Pocket Style':                         'pocket_style',
    'Flap On Jacket Pockets':                      null,
    'Shoulder Padding':                            'shoulder_padding',
    'Inside Pen And Ticket Pockets':               'inside_pen_ticket',
    'Satin Lapel':                                 'satin_lapel',
    'Personalise Monogramming Inside The Jacket':  'personalise_monogramming',
    'Enter Your Name: (max. 15 letters)':          'monogram_text',
    'Hand Stitching':                              null,
    'Working/Functional Button Cuffs':             'working_button_cuffs',
    'Inside Piping':                               'inside_piping',
    'Functional Boutonniere And Flower Loop':      'boutonniere_loop',
    'Pocket Piping':                               'pocket_piping',
    'Contrasting Buttonholes':                     'contrasting_buttonholes',
    'Contrasting Colors':                          'contrasting_colors',
    'Outside Ticket Pocket':                       'outside_ticket_pocket',
    'Design Your Waistcoat ':                      'waistcoat_design',
    'Back Pockets':                                'back_pockets',
    'Front Pockets Style':                         'front_pockets_style',
    'Belt Loops':                                  'belt_loops',
    'Pleat Style':                                 'pleat_style',
    'Hem/Cuffs':                                   'hem_cuffs',
    'Get an extra Pair of Trousers/Pants':         'extra_trousers',
    'Satin Stripe':                                'satin_stripe',
    'Adjustable Side Tabs':                        'adjustable_side_tabs',
    'Buttons for Brace':                           'buttons_for_brace',
    'Style Lapel':                                 'lapel_style',
    'Lapel Width':                                 'lapel_width',
    'MEASUREMENTS':                                null,
    'Jacket Size':                                 null,
    'Fit':                                         null,
    "Jacket's Fit":                                null,
    'Trousers Size':                               null,
    // display text / step labels – skip
    'STEP 4 (DESIGN YOUR SUIT)': null,
    'Make my suit standard size (No measurements required)': null,
    'JACKET': null,
    'NECK': null,
    'CHEST': null,
    'JACKET WAIST': null,
    'SEAT': null,
    'JACKET LENGTH': null,
    'SLEEVE LENGTH': null,
    'TROUSER WAIST': null,
    'INSEAM / INSIDE LEG': null,
  };

  // Measurement dropdown ids in order
  const MEASUREMENT_DROPDOWNS = new Set([
    'Jacket Size', 'Fit', "Jacket's Fit",
    'Neck', 'Chest', 'Jacket Waist', 'Seat',
    'Jacket Length', 'Sleeve Length',
    'Trouser Waist', 'Inseam / Inside Leg', 'Trousers Size',
    'Would you change the length of the sleeve?',
    'Would you change the length of the jacket?',
  ]);

  // displaytext groups to skip (they're info banners, not options)
  const SKIP_TYPES = new Set(['displaytext']);

  // ─── Build attributes array from API ─────────────────────────────────────
  const attributes = [];
  const seenIds = new Set();

  for (const optSet of optionSets) {
    const apiName = (optSet.public_name || optSet.internal_name || '').trim();
    const apiType = optSet.type;

    // Skip display-text banners (they're just info blocks)
    if (SKIP_TYPES.has(apiType)) continue;

    // Find matching existing attribute
    const existingAttrId = API_TO_EXISTING_ID[apiName] ?? API_TO_EXISTING_ID[apiName.trim()] ?? null;
    const existingAttr = existingAttrId ? existing[existingAttrId] : null;

    // Derive our attribute id (use existingAttrId if present so store lookups like selections['fabric'] work perfectly)
    let attrId = existingAttrId || slug(apiName);
    // Avoid duplicate ids (some groups share internal names like "DESIGN YOUR JACKET")
    if (seenIds.has(attrId)) {
      attrId = attrId + '_' + optSet.id;
    }
    seenIds.add(attrId);

    const displayType = mapDisplayType(apiType);
    const isMeasurement = MEASUREMENT_DROPDOWNS.has(apiName);

    // Helper to map asset URLs from /suits/ to /blazer/
    const updateAssetUrl = (url) => {
      if (!url) return url;
      return url.replace('/assets/men/suits/', '/assets/men/blazer/');
    };

    // ── Build options ──────────────────────────────────────────────────────
    const options = [];

    if (apiType === 'textbox') {
      // Text input – no options_values, render as text field
      // handled via displayType: 'text' with empty options
    } else {
      for (const val of (optSet.options_values || [])) {
        const optId = slug(val.value) || 'opt_' + val.id;
        const price = val.price ? val.price / 100 : 0;

        // Try to find matching option in existing config to get assets and properties
        let assets = [];
        let matchedOpt = null;

        if (existingAttr) {
          matchedOpt = existingAttr.options?.find(
            (o) =>
              o.id === optId ||
              slug(o.label) === optId ||
              o.id === slug(val.handle) ||
              optId.includes(o.id) ||
              optId.includes(o.id.replace('fab_', '')) ||
              (o.colorCode && optId.includes(o.colorCode))
          );
          if (matchedOpt?.assets) {
            assets = matchedOpt.assets.map(a => ({ ...a, url: updateAssetUrl(a.url) }));
          }
        }

        const opt = {
          id: optId,
          label: val.value.trim(),
          shopifyOptionValueId: val.id,
          shopifyHandle: val.handle,
          thumbnail: val.swatch || null,
          priceModifier: price,
          assets,
        };

        // For swatch fabrics, assign colorCode robustly
        if (attrId === 'fabric') {
          if (matchedOpt?.colorCode) {
            opt.colorCode = matchedOpt.colorCode;
          } else {
            // Extract from option handle or id (e.g. "100d8300_4_simple_grey" -> "simple_grey")
            const knownColors = [
              'navy_blue', 'navy', 'simple_grey', 'dusty_beige', 'grey_pinstripe', 
              'linen', 'royal_blue', 'soft_black', 'striped_blue', 'strong_black', 
              'taupe', 'textured_blue', 'threaded_black', 'walnut'
            ];
            const foundCode = knownColors.find(c => optId.includes(c));
            if (foundCode) {
              opt.colorCode = foundCode;
            } else if (optId.includes('plain_blue') || optId.includes('simple_blue')) {
              opt.colorCode = 'navy';
            } else if (optId.includes('soft_balck')) {
              opt.colorCode = 'soft_black';
            } else if (optId.includes('black')) {
              opt.colorCode = 'strong_black';
            } else if (optId.includes('grey')) {
              opt.colorCode = 'simple_grey';
            } else {
              opt.colorCode = 'navy'; // Safe default
            }
          }
        }

        // For style, assign styleCode and fallback assets robustly
        if (attrId === 'style') {
          if (matchedOpt?.styleCode) {
            opt.styleCode = matchedOpt.styleCode;
          } else {
            if (optId.includes('sb_1')) opt.styleCode = 'single_breasted';
            else if (optId.includes('sb_2')) opt.styleCode = 'single_breasted_2';
            else if (optId.includes('db_1_2') || optId.includes('db_1_3') || optId.includes('db_4')) opt.styleCode = 'double_breasted_4';
            else if (optId.includes('db_2_2') || optId.includes('db_2_3') || optId.includes('db_6')) opt.styleCode = 'double_breasted_6';
            else if (optId.includes('nehru') || optId.includes('mandarin')) opt.styleCode = 'mandarin';
            else opt.styleCode = 'single_breasted';
          }
          if (!opt.assets || !opt.assets.length) {
            opt.assets = [
              {
                url: `/assets/men/blazer/{{color}}/style/${opt.styleCode}/bottom.png`,
                zIndex: 45,
                className: "man_suit"
              }
            ];
          }
        }

        // For lapels, assign lapelCode and widthCode robustly
        if (attrId === 'lapel_style') {
          opt.lapelCode = matchedOpt?.lapelCode || optId.replace('lapel_', '');
        }
        if (attrId === 'lapel_width') {
          opt.widthCode = matchedOpt?.widthCode || optId.replace('width_', '');
        }

        options.push(opt);
      }
    }

    // ── Build attribute ────────────────────────────────────────────────────
    const attr = {
      id: attrId,
      label: apiName,
      shopifyOptionId: optSet.id,
      displayType,
      required: optSet.required ?? false,
      affectsPricing: optSet.affects_pricing ?? false,
    };

    // Copy commonAssets from existing (e.g. fabric has commonAssets)
    if (existingAttr?.commonAssets) {
      attr.commonAssets = existingAttr.commonAssets.map(a => ({ ...a, url: updateAssetUrl(a.url) }));
    }

    // Copy dependsOn from existing where relevant
    if (existingAttr?.dependsOn) {
      attr.dependsOn = existingAttr.dependsOn;
    }

    // Mark measurement fields
    if (isMeasurement) {
      attr.category = 'measurements';
      attr.dependsOn = {
        attributeId: 'measurements',
        value: ['standard_size', 'do_it_yourself_online'],
      };
    }

    // Conditions from API (show/hide logic)
    if (optSet.conditions?.length) {
      attr.conditions = optSet.conditions;
    }

    attr.options = options;

    // placeholder for text inputs
    if (apiType === 'textbox') {
      attr.placeholder = optSet.additional_info || 'Enter text…';
      attr.options = [];
    }

    attributes.push(attr);
  }

  // ─── Preserve pocket_squares and buttons from existing (not in API) ──────
  const extraAttrs = ['pocket_squares', 'buttons'];
  for (const id of extraAttrs) {
    if (existing[id]) {
      attributes.push({
        ...existing[id],
        _note: 'Preserved from static men-blazer.json (not in Shopify API)',
      });
    }
  }

  // Dynamically build defaultSelections based on new option IDs so store initializes correctly
  const defaultSelections = { ...existingBlazer.defaultSelections };
  for (const attr of attributes) {
    if (attr.options && attr.options.length > 0) {
      // Find if old default exists or take first option
      const oldDefault = defaultSelections[attr.id];
      const matchingOpt = attr.options.find(o => o.id === oldDefault);
      if (!matchingOpt) {
        defaultSelections[attr.id] = attr.options[0].id;
      }
    }
  }

  // ─── Build final config ──────────────────────────────────────────────────
  const config = {
    productId: 'men-blazer-api',
    shopifyProductId: '8629892369',
    dataSource: 'api',
    apiUrl: API_URL,
    basePrice: existingBlazer.basePrice,
    _note:
      'Auto-generated by scripts/generate-blazer-api-config.js. Uses API option names (e.g. SB 2 Button). Re-run script to refresh from Shopify.',
    defaultSelections,
    sharedLayers: existingBlazer.sharedLayers,
    attributes,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(config, null, 2), 'utf8');
  console.log(`\n✅ Written to ${OUT_FILE}`);
  console.log(`   Attributes: ${attributes.length}`);
  console.log(
    `   Total options: ${attributes.reduce((s, a) => s + (a.options?.length || 0), 0)}`
  );
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
