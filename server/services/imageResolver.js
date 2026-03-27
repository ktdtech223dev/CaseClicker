// Image Resolver Service
// Fetches skin/case image URLs from the public ByMykel CS2 API
// and populates the in-memory case data + SQLite cache

const { getDb } = require('../db/database');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json';
const SKINS_API_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json';

// Local file cache directory for EXE builds
function getLocalCacheDir() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'cache');
  }
  if (process.env.APPDATA && process.resourcesPath) {
    return path.join(process.env.APPDATA, 'CaseClicker', 'cache');
  }
  return null;
}

function saveLocalFileCache(lookupMap) {
  const dir = getLocalCacheDir();
  if (!dir) return;
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const data = {};
    for (const [key, url] of lookupMap) data[key] = url;
    fs.writeFileSync(path.join(dir, 'image_cache.json'), JSON.stringify(data));
    console.log(`[ImageResolver] Saved ${Object.keys(data).length} entries to local file cache`);
  } catch (e) {
    console.warn('[ImageResolver] Local file cache save failed:', e.message);
  }
}

function loadLocalFileCache() {
  const dir = getLocalCacheDir();
  if (!dir) return new Map();
  try {
    const filePath = path.join(dir, 'image_cache.json');
    if (!fs.existsSync(filePath)) return new Map();
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const map = new Map();
    for (const [key, url] of Object.entries(data)) map.set(key, url);
    console.log(`[ImageResolver] Loaded ${map.size} entries from local file cache`);
    return map;
  } catch {
    return new Map();
  }
}

// Hardcoded fallback case images for cases the API might miss
const CASE_IMAGE_FALLBACKS = {
  'operation phoenix case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFAuh6qZJmlD7tiyl4OIlaGhYuKAxm9XuJBy2ruT84n0jAe2-kI4YD-mcoaUcVU_MlqBr1O_we_phcO0tJ_MyyRh6yEi7S3bmkG10wcbYVHU/256x192',
  'operation breakout case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU0naKcITtBtN3kxtbYwqb2a77TwDsAu5dz2LjFotSh0QXg_kBqZG3wdoKRJA48MlyD-Ae8kOa6h8e5vJnKnXFgvXIn4ivYylGp1kxPbLFxxavIHFKXD4qFNw/256x192',
  'operation vanguard case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU3narKfGZGtN3gxtbYw6bwYuKGz2kG65F307vFpIr0igaw_UY-Y2v1IYHBJVRqZl6C_FG8l-_sg5e6upvBySdipSoh0ndUtizVmhB8aLJ5xw/256x192',
  'huntsman case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFAynfKbIW0TvN_kl9OOkq_xMuqIz2kGu5Qg0r2Q9Nmsxwa2_kQ_ZGiid4WVJwM3MwnR-gm2x7zn0cK-u8zAwXVh63Zw7WGdwUIj3ZxgaA/256x192',
  'winter offensive case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFAuh_CaJGVD7t7nd4OIkqT3MO6Bz2oHvcBy3-iToY-l31Xi80M6YWCmJ4KXdlI7NlrT_li8kO2505K66sycn3Zu6nIn53Ql0nfamhGplh9Lew/256x192',
  'chroma 2 case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU2nfGaJG0btN3kxtbbka_xMuqIz28FvZBy3r-X84r0xgLg-0ZqYGGhdYSSdwA6aFqD_1i8yOfthcDpvJnPyHVh6yFxsGGdwUKGMw_U/256x192',
  'chroma 3 case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU1nfbOIj8W7oWzkYbek6WnNvLTzm9XvpZx0-yQoY2h2wLi_UZlZTuncYKWdVBtM17ZqAPpwby8gp-06snAy3Fk7igj5mGdwUKGxfjL/256x192',
  'falchion case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU0h_KfcTl9t93kxoWIwab2a77Twm4Fu5Qji7uVpd-h3wex-0FoZGunI9eUe1BrZ13RrAK4yOjt08bqvpqYmiR07CEm-z-DyRLniVlSLrs4iKjIJQHH/256x192',
  'shadow case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU3naGdIThA49C_kYaylIa0Y-KGlj8E7MRj3b3C89T33Qaw_hBqYjumddKRdAA8Z1_RqVW_xOi6h5G_75TLnyR9-z5iuyi0Qxfa0RpIY/256x192',
  'revolver case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU4narKfGRGtdjgxtiOx6ehY-OGzj4Dv50ni7uUotug2Afk-0FoamH6JdWXJAU8ZQzT-VW_xem6hcW-6pnLmnFluCYh7SrelkPihh9Lew/256x192',
  'gamma case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU5narKfGZG7N_gkYbYwqWtY-KGlWkGu8cj27yZ9Irz3Vfg-UdqNm6nLIPBJwQ7aVqG_1W_x-a6hJ--uMzMyCdkvCQn4CqOlxSpwUYb1v4sxQ/256x192',
  'gamma 2 case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFUynfWaJ25D6eO6nYeDw7-NMOKBwDgBvMRwjruVo4v03gCA8kU_ZjqhIoKUdlU9YQuE_FO-kOy9h5a5vp_AzXpk7nZ04CvezRaphQv330uxeAGIgg/256x192',
  'glove case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU2nfGaJ20btd_hxoWIx6WnNPLQzjlVu8Fy3-iToY-l31Xi80M6Z2HzctCXJF1I2a1yEq1m1xO_shZG8vp_ByHB9-z5iuizdIQv3hxpIcKUK0dGH/256x192',
  'spectrum case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQxnaecIT9D_9i3h4OEhfD1DLXQF2kB6MRmierVoP_GlgfrChFCazumJoKXJAc2ZFvTqVK_ph9bi7MW7tZnNzCQ97Shx-z-DyBz-0wdJKOJtia_MHArY/256x192',
  'spectrum 2 case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQynaSdJGhE_t_hxoWIxKfxNvLQzjlVu8Fy2uvFrNSnjFbj_0BpN2H3coCUcAA6NAnR_lm1xO_shZG8vp_IyCRgvycn7GGdwUI_nYVWC7M/256x192',
  'horizon case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQznaKdJGhE_t_hxoWIxKfxMeKAxDsBuJVxj7CYoI-m0FHlrhVlZBehJIKVJgdrNQ7Z41i-xey5gsDpvZjMnyFh63dw5mGdwUIfwuiH/256x192',
  'clutch case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQznaKkJG0SuIr3xIdThPLxN_mDk2kGu5Ep2LiYp9in0VDg_0c_amCmcIPBdQM5MlnT-la1xLy8jJa7upnKn3Zu6So8pSGdwELcL_dh3A/256x192',
  'danger zone case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQznaKkJG0SuIr3xIdThPLxDfmDlGkH7cRy07uYo4_zjVCx-UM-amimI4TEdQY7MFnY_la1xLy8jJfpuJjMznBh6X0q5SvezRaph1JJOKEQ0oqFNxGi/256x192',
  'prisma case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQznaahIj4R0oDykYSFk_b1PfrQxTsJvJIo0uyTrI-h21Dl8kRrYWjxdYeRelM5MV6F_lK4w-fs0Ze76JvPnXR9-z5iuiiJSkaxhwYbOKl1v/256x192',
  'prisma 2 case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU1naGcJjwT7I6yxITYxqHxY-OHwzsFuJcg0r2XrNqg2QLi_0M5YW6nJ4eSelQ_YVyE_ga4wejthZ-9v8_Azic96SJyuykn/256x192',
  'fracture case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU2nfOaNzQWtYu0x9bextO7NfLTzm9XvpZx0-yQoY2h2wLi_UZlZTuncYKWdVBtM17ZqALolPvihIe4uZ-bzHpn6XUh4HaLlEHjgx9KbewvzqGVHFDX/256x192',
  'snakebite case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU3naSaKWRDvYe1kteOlqD3MeKGxG0BuJJ1i7qWpo6migTh_UM_N2n6doSScgZoNQvR81Drl-a5hMK96ZvByiZg7ith4CrelxPigR9IO60K0tHdURbM/256x192',
  'operation riptide case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFU3naSdITtBtNnmxtbfxaPxNuqGxG0BuJR00LiZpIih2wXl_kc5Y2CmJICVdQc3ZVDT_lG5xevqjcfvu8nIzndkvCQn4CqOl0apwUYbhv6DU7E/256x192',
  'recoil case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FF4ynaSdJGhE7t_hmoWIxKWhNPLQzjlVu8Fy3O_FoNug2lew8hVtZGqhIIaSe1I_NF2G-1e_l-jshcfp75XLzSdm7T5s5SnezRephx9MOK8A0cefeNKNvg/256x192',
  'revolution case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FF4ynaSdJGhE_v-OOlc7OIxKahZOyFxD4AuMYm27yZ9Iri2wbg-0U_NmD6JoKRcVA-aVHS-QO7lO2505K_v5bPyHdjuCYi7SmIzBbihR9IOKMK0tGeRFrS/256x192',
  'dreams & nightmares case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQynaCZMj9D_xIW0kIyKk_b1NvLQzjlVu8Fy3rvDoN6l2Vew8hVtNW-dItCQcVA5Z1vRrlK2lOm60JO5u5TMyiY27Txt5SnezRaphx9IO60K0tGBOFbH/256x192',
  'kilowatt case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FF4ynfCaJG0SvI63w9jdxaKhZ-KFxm4Fv8Ai2LiVpd-t2Vfi_kJoYGnzJ4OWdlU6Ml3Q-lm9xO-6hMW0u8nNyCdivCRw-z-DyF3phRxJcKUK0ZzfUBCD/256x192',
  'gallery case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ0naGzMj5D6dC_mL-ZhPbiMbmIk2kGu5Ao07iWo4n2jQCx-UM-ZmGnI4LHcQN-Y12Gq1Dqxu-9jcK66pjOnXBivz5iuyzulRfigx9IOKMK0tHaW_Kd/256x192',
  'shattered web case': 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQznaKhJmkQ7t_blmoWIx6KkYu-FxD4AuMZx07yX9IqmjQHn-RBoZW_xJYCQcVA5ZVHS-QO7lO2505K5oJTMziE96Hcj4HaLy0C-gB8dOKIK0tHaHKLd/256x192',
};

// Normalize case names for fallback lookup
function normalizeCaseName(name) {
  if (!name) return '';
  return name.toLowerCase().trim();
}

// Normalize skin names for matching (remove diacritics, lowercase, trim)
function normalize(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/★\s*/g, '')
    .replace(/stattrak™?\s*/gi, '')
    .replace(/\s*\(.*?\)\s*/g, '') // remove wear in parens
    .replace(/[^a-z0-9|]/g, '')
    .trim();
}

// Extract just the hash from a full Steam CDN URL
function extractHash(url) {
  if (!url) return '';
  // If it's already just a hash (no http), return as-is
  if (!url.startsWith('http')) return url;
  // Extract from: https://community.akamai.steamstatic.com/economy/image/HASH
  // or: https://community.cloudflare.steamstatic.com/economy/image/HASH/WxH
  const match = url.match(/\/economy\/image\/([^/]+)/);
  if (match) return match[1];
  // Return full URL as fallback (our helper handles full URLs too)
  return url;
}

async function fetchJson(url) {
  // Use dynamic import for node-fetch in CommonJS
  let fetchFn;
  try {
    fetchFn = (await import('node-fetch')).default;
  } catch {
    // Fallback to global fetch (Node 18+)
    fetchFn = globalThis.fetch;
  }
  if (!fetchFn) {
    console.warn('[ImageResolver] No fetch available, skipping image resolution');
    return null;
  }
  const resp = await fetchFn(url, { timeout: 30000 });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

// Build a lookup map from the API data
function buildLookupMap(cratesData, skinsData) {
  const map = new Map(); // normalized skin name -> image URL

  // Process crates for case cover images AND contained skins
  if (Array.isArray(cratesData)) {
    for (const crate of cratesData) {
      // Case cover image
      if (crate.image && crate.name) {
        map.set('case:' + normalize(crate.name), crate.image);
      }

      // Skins inside cases
      if (crate.contains) {
        for (const skin of crate.contains) {
          if (skin.image && skin.name) {
            const key = normalize(skin.name);
            if (!map.has(key)) map.set(key, skin.image);
          }
        }
      }

      // Rare special items (knives/gloves)
      if (crate.contains_rare) {
        for (const rare of crate.contains_rare) {
          if (rare.image && rare.name) {
            const key = normalize(rare.name);
            if (!map.has(key)) map.set(key, rare.image);

            // Also store under base name (without finish) for matching
            // e.g. "★ Karambit | Fade" -> store under normalized "karambit" too
            const baseName = rare.name.split(' | ')[0];
            const baseKey = normalize(baseName);
            if (baseKey && !map.has(baseKey)) map.set(baseKey, rare.image);
          }
        }
      }
    }
  }

  // Process individual skins API for broader coverage
  if (Array.isArray(skinsData)) {
    for (const skin of skinsData) {
      if (skin.image && skin.name) {
        const key = normalize(skin.name);
        if (!map.has(key)) map.set(key, skin.image);
      }
    }
  }

  return map;
}

// Populate in-memory case data with image URLs
function populateCaseData(cases, lookupMap) {
  let resolved = 0;
  let total = 0;

  for (const cs of cases) {
    // Resolve case cover image
    if (!cs.image || cs.image.length < 10) {
      const caseKey = 'case:' + normalize(cs.name);
      const url = lookupMap.get(caseKey);
      if (url) {
        cs.image = url;
        resolved++;
      } else {
        // Try hardcoded fallback
        const fallback = CASE_IMAGE_FALLBACKS[normalizeCaseName(cs.name)];
        if (fallback) {
          cs.image = fallback;
          resolved++;
        }
      }
    }
    total++;

    // Resolve skin images
    if (cs.skins) {
      for (const skin of cs.skins) {
        total++;
        if (!skin.image_id || skin.image_id.length < 10) {
          const key = normalize(skin.name);
          const url = lookupMap.get(key);
          if (url) {
            skin.image_id = url;
            resolved++;
          }
        }
      }
    }

    // Resolve rare special images
    if (cs.rare_special) {
      for (const rare of cs.rare_special) {
        total++;
        if (!rare.image_id || rare.image_id.length < 10) {
          const key = normalize(rare.name);
          const url = lookupMap.get(key);
          if (url) {
            rare.image_id = url;
            resolved++;
          }
        }
      }
    }
  }

  return { resolved, total };
}

// Save resolved images to SQLite cache
function saveToCache(lookupMap) {
  try {
    const db = getDb();
    if (!db) return;

    // Create image cache table if not exists
    db.prepare(`CREATE TABLE IF NOT EXISTS image_cache (
      skin_name TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      last_fetched INTEGER DEFAULT (strftime('%s','now'))
    )`).run();

    const stmt = db.prepare('INSERT OR REPLACE INTO image_cache (skin_name, image_url) VALUES (?, ?)');
    for (const [key, url] of lookupMap) {
      try { stmt.run(key, url); } catch {}
    }
  } catch (e) {
    console.warn('[ImageResolver] Cache save failed:', e.message);
  }
}

// Load cached images from SQLite
function loadFromCache() {
  try {
    const db = getDb();
    if (!db) return new Map();

    // Ensure table exists
    db.prepare(`CREATE TABLE IF NOT EXISTS image_cache (
      skin_name TEXT PRIMARY KEY,
      image_url TEXT NOT NULL,
      last_fetched INTEGER DEFAULT (strftime('%s','now'))
    )`).run();

    const rows = db.prepare('SELECT skin_name, image_url FROM image_cache').all();
    const map = new Map();
    for (const row of rows) {
      map.set(row.skin_name, row.image_url);
    }
    return map;
  } catch {
    return new Map();
  }
}

// Main resolver function — call on server startup
async function resolveImages(cases) {
  console.log('[ImageResolver] Starting image resolution...');

  // First try loading from local file cache (fastest for EXE)
  let lookupMap = loadLocalFileCache();

  // Then merge SQLite cache
  const sqliteCache = loadFromCache();
  for (const [key, url] of sqliteCache) {
    if (!lookupMap.has(key)) lookupMap.set(key, url);
  }

  if (lookupMap.size > 50) {
    console.log(`[ImageResolver] Loaded ${lookupMap.size} cached images`);
    const { resolved, total } = populateCaseData(cases, lookupMap);
    console.log(`[ImageResolver] Populated ${resolved}/${total} items from cache`);
    if (resolved > total * 0.5) {
      // Good enough from cache, refresh in background
      refreshFromApi(cases, lookupMap).catch(e =>
        console.warn('[ImageResolver] Background refresh failed:', e.message)
      );
      return;
    }
  }

  // Fetch fresh data from API
  await refreshFromApi(cases, lookupMap);
}

async function refreshFromApi(cases, existingMap) {
  try {
    console.log('[ImageResolver] Fetching from ByMykel CS2 API...');

    // Fetch both endpoints in parallel
    const [cratesData, skinsData] = await Promise.all([
      fetchJson(API_URL).catch(e => { console.warn('[ImageResolver] Crates API failed:', e.message); return null; }),
      fetchJson(SKINS_API_URL).catch(e => { console.warn('[ImageResolver] Skins API failed:', e.message); return null; }),
    ]);

    if (!cratesData && !skinsData) {
      console.warn('[ImageResolver] Both APIs failed — using cached data only');
      return;
    }

    const lookupMap = buildLookupMap(cratesData, skinsData);

    // Merge with existing cache
    if (existingMap) {
      for (const [key, url] of existingMap) {
        if (!lookupMap.has(key)) lookupMap.set(key, url);
      }
    }

    console.log(`[ImageResolver] Built lookup map with ${lookupMap.size} entries`);

    const { resolved, total } = populateCaseData(cases, lookupMap);
    console.log(`[ImageResolver] Populated ${resolved}/${total} items from API`);

    // Save to cache (both SQLite and local file)
    saveToCache(lookupMap);
    saveLocalFileCache(lookupMap);
    console.log('[ImageResolver] Saved to cache');
  } catch (e) {
    console.error('[ImageResolver] Error:', e.message);
  }
}

// Endpoint handler — resolve a single skin image on demand
async function resolveSingleImage(skinName) {
  const key = normalize(skinName);

  // Check cache first
  try {
    const db = getDb();
    if (db) {
      const row = db.prepare('SELECT image_url FROM image_cache WHERE skin_name = ?').get(key);
      if (row) return row.image_url;
    }
  } catch {}

  // Try Steam Market render API as last resort
  try {
    const encoded = encodeURIComponent(skinName);
    const url = `https://steamcommunity.com/market/listings/730/${encoded}/render?start=0&count=1&currency=1&format=json`;
    const data = await fetchJson(url);
    if (data && data.results_html) {
      const match = data.results_html.match(/economy\/image\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const imageUrl = `https://community.cloudflare.steamstatic.com/economy/image/${match[1]}/256x192`;
        // Cache it
        try {
          const db = getDb();
          if (db) {
            db.prepare('INSERT OR REPLACE INTO image_cache (skin_name, image_url) VALUES (?, ?)').run(key, imageUrl);
          }
        } catch {}
        return imageUrl;
      }
    }
  } catch {}

  return null;
}

module.exports = {
  resolveImages,
  resolveSingleImage,
  normalize,
};
