// Format price with $
export function formatPrice(price) {
  if (price == null) return '$0.00';
  return `$${Number(price).toFixed(2)}`;
}

// Get rarity color class
export function getRarityColor(rarity) {
  const map = {
    'Consumer Grade': '#b0c3d9',
    'Industrial Grade': '#5e98d9',
    'Mil-Spec': '#4b69ff',
    'Restricted': '#8847ff',
    'Classified': '#d32ce6',
    'Covert': '#eb4b4b',
    'Rare Special': '#e4b900',
  };
  return map[rarity] || '#b0c3d9';
}

export function getRarityBgClass(rarity) {
  const map = {
    'Consumer Grade': 'rarity-bg-consumer',
    'Industrial Grade': 'rarity-bg-industrial',
    'Mil-Spec': 'rarity-bg-milspec',
    'Restricted': 'rarity-bg-restricted',
    'Classified': 'rarity-bg-classified',
    'Covert': 'rarity-bg-covert',
    'Rare Special': 'rarity-bg-rare-special',
  };
  return map[rarity] || 'rarity-bg-consumer';
}

export function getRarityGlow(rarity) {
  const map = {
    'Classified': 'glow-pink',
    'Covert': 'glow-red',
    'Rare Special': 'glow-gold',
    'Restricted': 'glow-purple',
    'Mil-Spec': 'glow-blue',
  };
  return map[rarity] || '';
}

// Get skin image URL — supports full URLs, Steam CDN hashes, and server fallback
export function getSkinImageUrl(imageId, skinName) {
  if (imageId && imageId.length > 10) {
    if (imageId.startsWith('http')) return imageId;
    return `https://community.cloudflare.steamstatic.com/economy/image/${imageId}/256x192`;
  }
  // No static image — return null, SkinImage component handles fallback
  return null;
}

// Get case cover image URL
export function getCaseImageUrl(caseImage, caseName) {
  if (caseImage && caseImage.length > 10) return caseImage;
  return null;
}

// Resolve a skin image from the server (for on-demand lookups)
const _imageCache = new Map();
export async function resolveImageFromServer(skinName) {
  if (!skinName) return null;
  if (_imageCache.has(skinName)) return _imageCache.get(skinName);

  try {
    const resp = await fetch(`/api/images/resolve?name=${encodeURIComponent(skinName)}`);
    if (resp.ok) {
      const data = await resp.json();
      if (data.image_url) {
        _imageCache.set(skinName, data.image_url);
        return data.image_url;
      }
    }
  } catch {}
  _imageCache.set(skinName, null);
  return null;
}

// Format float value
export function formatFloat(value) {
  return Number(value).toFixed(8);
}

// Short wear label
export function wearShort(wear) {
  const map = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
  };
  return map[wear] || wear;
}

// Extract weapon name from full skin name (e.g. "AK-47 | Head Shot" -> "AK-47")
export function getWeaponName(skinName) {
  if (!skinName) return '?';
  const parts = skinName.split(' | ');
  return parts[0] || skinName;
}

// Extract finish name from full skin name (e.g. "AK-47 | Head Shot" -> "Head Shot")
export function getFinishName(skinName) {
  if (!skinName) return '';
  const parts = skinName.split(' | ');
  return parts[1] || '';
}

// Format large numbers for display
export function formatLargeNumber(num) {
  if (num == null) return '$0.00';
  const n = Number(num);
  if (n < 1000) return `$${n.toFixed(2)}`;
  if (n < 1000000) return `$${(n / 1000).toFixed(1)}K`;
  if (n < 1000000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n < 1000000000000) return `$${(n / 1000000000).toFixed(2)}B`;
  return `$${(n / 1000000000000).toFixed(2)}T`;
}
