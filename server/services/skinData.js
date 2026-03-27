// CS:GO Skin Data Service
// Delegates to the comprehensive allCases.js data file
// while maintaining backward compatibility with original API

const allCasesData = require('../data/allCases');

// Re-export everything from allCases (cases array is mutable — imageResolver populates image_ids at runtime)
const { cases, getCaseById, getAllCases, getAllMarketHashNames } = allCasesData;

// Also export the detailed knife/glove data
const {
  KNIFE_TYPES,
  KNIFE_FINISHES,
  GLOVE_TYPES,
  GLOVE_FINISHES,
  RARITY_ODDS,
  WEAR_RANGES,
  getWeaponCases,
  getStickerCapsules,
  getSouvenirPackages,
  getRandomWear,
  simulateCaseOpening,
  getAllKnives,
  getAllGloves,
  getKnifeFinishes,
  getGloveFinishes,
} = allCasesData;

module.exports = {
  cases,
  getCaseById,
  getAllCases,
  getAllMarketHashNames,
  KNIFE_TYPES,
  KNIFE_FINISHES,
  GLOVE_TYPES,
  GLOVE_FINISHES,
  RARITY_ODDS,
  WEAR_RANGES,
  getWeaponCases,
  getStickerCapsules,
  getSouvenirPackages,
  getRandomWear,
  simulateCaseOpening,
  getAllKnives,
  getAllGloves,
  getKnifeFinishes,
  getGloveFinishes,
};
