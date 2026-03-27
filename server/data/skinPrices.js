// ============================================================================
// CS2 Skin Price Database - Hardcoded Market Prices (USD)
// ============================================================================
// Priority: prices.json (from scraper) > hardcoded > rarity fallback
// ============================================================================

const fs = require('fs');
const path = require('path');

const SKIN_PRICES = {

  // ========================================================================
  // AK-47 SKINS
  // ========================================================================
  'AK-47 | Safari Mesh':            { fn: 19.96, mw: 0.30,  ft: 0.09,  ww: 0.12,  bs: 0.10 },
  'AK-47 | Case Hardened':          { fn: 1419.98, mw: 391.53, ft: 287.50, ww: 294.44, bs: 265.57 },
  'AK-47 | Red Laminate':           { fn: 749,   mw: 317.71, ft: 92,    ww: 85.19, bs: 88.01 },
  'AK-47 | Fire Serpent':           { fn: 2500,  mw: 1500,  ft: 1200,  ww: 1725,  bs: 650 },
  'AK-47 | Redline':                { fn: 255.22, mw: 255.22, ft: 44.74, ww: 39.68, bs: 37.05 },
  'AK-47 | Vulcan':                 { fn: 1129.59, mw: 600,  ft: 274.40, ww: 187.08, bs: 166.67 },
  'AK-47 | Jaguar':                 { fn: 1450,  mw: 341.68, ft: 107.61, ww: 99.64, bs: 107.43 },
  'AK-47 | Wasteland Rebel':        { fn: 754.07, mw: 244.03, ft: 110.06, ww: 111.72, bs: 121.61 },
  'AK-47 | Aquamarine Revenge':     { fn: 366.88, mw: 99.64, ft: 57.55, ww: 51.15, bs: 53.66 },
  'AK-47 | Frontside Misty':        { fn: 295.58, mw: 47.12, ft: 24.67, ww: 24.41, bs: 21.62 },
  'AK-47 | Point Disarray':         { fn: 145.73, mw: 31.90, ft: 20.87, ww: 22.77, bs: 19.14 },
  'AK-47 | Neon Rider':             { fn: 430.85, mw: 107.58, ft: 62.36, ww: 75.32, bs: 59.48 },
  'AK-47 | Bloodsport':             { fn: 284.70, mw: 221,   ft: 180,   ww: 200.19, bs: 180 },
  'AK-47 | The Empress':            { fn: 500.29, mw: 139.04, ft: 129,  ww: 122.13, bs: 127.65 },
  'AK-47 | Asiimov':                { fn: 930,   mw: 78.40, ft: 57.51, ww: 56.18, bs: 55.20 },
  'AK-47 | Uncharted':              { fn: 5.55,  mw: 1.52,  ft: 1.09,  ww: 1.74,  bs: 1.06 },
  'AK-47 | Phantom Disruptor':      { fn: 56.89, mw: 12.93, ft: 8.05,  ww: 11.17, bs: 7.82 },
  'AK-47 | Panthera onca':          { fn: 1334.12, mw: 497.03, ft: 399.69, ww: 292.24, bs: 370.42 },
  'AK-47 | Slate':                  { fn: 26.53, mw: 10.77, ft: 7.09,  ww: 7.18,  bs: 6.64 },
  'AK-47 | Leet Museo':             { fn: 1200,  mw: 460,   ft: 300.05, ww: 157.16, bs: 123.47 },
  'AK-47 | Nightwish':              { fn: 200.64, mw: 113.82, ft: 90.25, ww: 95.01, bs: 93.54 },
  'AK-47 | Ice Coaled':             { fn: 28.36, mw: 12.31, ft: 7.45,  ww: 8.94,  bs: 6.41 },
  'AK-47 | Head Shot':              { fn: 186,   mw: 87.93, ft: 54,    ww: 42.98, bs: 41 },
  'AK-47 | Inheritance':            { fn: 218.44, mw: 110,   ft: 67.20, ww: 66.50, bs: 56.94 },
  'AK-47 | Cartel':                 { fn: 136.70, mw: 34.30, ft: 25.68, ww: 30.51, bs: 25.30 },
  'AK-47 | Elite Build':            { fn: 19.56, mw: 5.07,  ft: 3.12,  ww: 2.47,  bs: 2.30 },
  'AK-47 | Hydroponic':             { fn: 2500,  mw: 2100,  ft: 1946,  ww: 1600,  bs: 1305.42 },
  'AK-47 | Fuel Injector':          { fn: 968.39, mw: 387.91, ft: 260.68, ww: 206.50, bs: 159.51 },
  'AK-47 | Wild Lotus':             { fn: 5000,  mw: 3500,  ft: 2500,  ww: 2000,  bs: 1800 },
  'AK-47 | Blue Laminate':          { fn: 83.41, mw: 23.53, ft: 22.16, ww: 30.41, bs: 20 },
  'AK-47 | Neon Revolution':        { fn: 510.44, mw: 164.84, ft: 144.82, ww: 148.05, bs: 141.22 },
  'AK-47 | Legion of Anubis':       { fn: 91.68, mw: 51.75, ft: 50,    ww: 47.56, bs: 45.78 },
  'AK-47 | Green Laminate':         { fn: 242.88, mw: 73.50, ft: 41.22, ww: 78.62, bs: 40 },
  'AK-47 | Black Laminate':         { fn: 1071.28, mw: 168.75, ft: 50,  ww: 50.98, bs: 52.14 },
  'AK-47 | Orbit Mk01':             { fn: 251,   mw: 69.73, ft: 44.93, ww: 56.17, bs: 43.21 },
  'AK-47 | Emerald Pinstripe':      { fn: 36.41, mw: 6.50,  ft: 4.57,  ww: 4.06,  bs: 3.97 },
  'AK-47 | Predator':               { fn: 101.37, mw: 25.66, ft: 14.50, ww: 16.07, bs: 16 },
  'AK-47 | Baroque Purple':         { fn: 186.53, mw: 23.09, ft: 9.15,  ww: 7.59,  bs: 8.01 },
  'AK-47 | Nouveau Rouge':          { fn: 229.90, mw: 72.41, ft: 23.98, ww: 16.50, bs: 15.36 },
  'AK-47 | Midnight Laminate':      { fn: 42.29, mw: 20.74, ft: 7.44,  ww: 8.62,  bs: 5.03 },
  'AK-47 | Safety Net':             { fn: 30.33, mw: 6.67,  ft: 4.65,  ww: 6.33,  bs: 4.52 },
  'AK-47 | Searing Rage':           { fn: 70.68, mw: 12.82, ft: 7.43,  ww: 7.52,  bs: 6.86 },
  'AK-47 | Rat Rod':                { fn: 141.22, mw: 13.91, ft: 6.67,  ww: 6.58,  bs: 6.51 },
  'AK-47 | Crane Flight':           { fn: 261.09, mw: 113.79, ft: 63.14, ww: 42.89, bs: 41 },
  'AK-47 | The Oligarch':           { fn: 550.32, mw: 197.57, ft: 118.99, ww: 73.28, bs: 57.47 },
  'AK-47 | First Class':            { fn: 359,   mw: 179.58, ft: 144.25, ww: 123.47, bs: 115 },
  'AK-47 | Aphrodite':              { fn: 575,   mw: 62.58, ft: 32.80, ww: 28.29, bs: 23.47 },
  'AK-47 | B the Monster':          { fn: 1788.44, mw: 642.78, ft: 329.75, ww: 272.72, bs: 138 },
  'AK-47 | Jet Set':                { fn: 1800,  mw: 785.30, ft: 513.24, ww: 568,   bs: 617.39 },
  'AK-47 | X-Ray':                  { fn: 1800,  mw: 1200,  ft: 1470.22, ww: 889.03, bs: 642.99 },
  'AK-47 | Crossfade':              { fn: 10.44, mw: 6.10,  ft: 3.18,  ww: 3.92,  bs: 2.94 },
  'AK-47 | Steel Delta':            { fn: 32.85, mw: 6.53,  ft: 3.50,  ww: 3.58,  bs: 3.62 },
  'AK-47 | Breakthrough':           { fn: 39.14, mw: 14.12, ft: 8.19,  ww: 8.19,  bs: 3.95 },
  'AK-47 | Wintergreen':            { fn: 12,    mw: 4.98,  ft: 1.45,  ww: 2.39,  bs: 1.15 },
  'AK-47 | Olive Polycam':          { fn: 1.11,  mw: 0.20,  ft: 0.11,  ww: 0.13,  bs: 0.12 },
  'AK-47 | The Outsiders':          { fn: 159.88, mw: 28.12, ft: 11.81, ww: 11,    bs: 12.04 },

  // ========================================================================
  // AWP SKINS
  // ========================================================================
  'AWP | Safari Mesh':               { fn: 22.48, mw: 0.43,  ft: 0.19,  ww: 0.21,  bs: 0.24 },
  'AWP | Lightning Strike':          { fn: 868.94, mw: 1012.52, ft: 0,  ww: 0,     bs: 0 },
  'AWP | BOOM':                      { fn: 925.75, mw: 242,   ft: 150.65, ww: 0,   bs: 0 },
  'AWP | Graphite':                  { fn: 297.76, mw: 284.70, ft: 0,   ww: 0,     bs: 0 },
  'AWP | Asiimov':                   { fn: 0,     mw: 0,     ft: 170.39, ww: 125.53, bs: 98.99 },
  'AWP | Redline':                   { fn: 0,     mw: 105.52, ft: 53.29, ww: 66.72, bs: 0 },
  'AWP | Hyper Beast':               { fn: 325,   mw: 75.32, ft: 50.98, ww: 46.85, bs: 46.30 },
  'AWP | Phobos':                    { fn: 9.57,  mw: 4,     ft: 3,     ww: 6.11,  bs: 0 },
  'AWP | Oni Taiji':                 { fn: 1611.95, mw: 783.07, ft: 502.33, ww: 531.79, bs: 0 },
  'AWP | Fever Dream':               { fn: 43.04, mw: 21.68, ft: 19.18, ww: 18.57, bs: 17.67 },
  'AWP | Mortis':                    { fn: 24.77, mw: 8.32,  ft: 6.11,  ww: 7.18,  bs: 6.30 },
  'AWP | Neo-Noir':                  { fn: 86.89, mw: 63.73, ft: 59.46, ww: 60.67, bs: 51.86 },
  'AWP | Containment Breach':        { fn: 1594.86, mw: 333,  ft: 152.66, ww: 88.80, bs: 73.71 },
  'AWP | Atheris':                   { fn: 50.65, mw: 11.24, ft: 6.61,  ww: 6.23,  bs: 5.24 },
  'AWP | Wildfire':                  { fn: 374.23, mw: 104,   ft: 61.50, ww: 66.61, bs: 58.16 },
  'AWP | Chromatic Aberration':      { fn: 146.07, mw: 68.03, ft: 50.04, ww: 44.04, bs: 42.61 },
  'AWP | Duality':                   { fn: 25.01, mw: 9.22,  ft: 6,     ww: 6.11,  bs: 4.91 },
  'AWP | Crakow!':                   { fn: 370.76, mw: 122.01, ft: 59.68, ww: 45.39, bs: 33.72 },
  'AWP | Chrome Cannon':             { fn: 142.60, mw: 53.21, ft: 44,    ww: 39.75, bs: 39.98 },
  'AWP | Electric Hive':             { fn: 218.50, mw: 58.61, ft: 46.76, ww: 67.53, bs: 0 },
  'AWP | Fade':                      { fn: 1580.51, mw: 1605.21, ft: 0, ww: 0,     bs: 0 },
  'AWP | Printstream':               { fn: 499.17, mw: 134.20, ft: 78.50, ww: 63.17, bs: 62.06 },
  'AWP | Dragon Lore':               { fn: 8000,  mw: 5000,  ft: 3500,  ww: 2500,  bs: 2000 },
  'AWP | Gungnir':                   { fn: 6000,  mw: 3500,  ft: 2800,  ww: 2200,  bs: 1800 },
  'AWP | Man-o\'-war':               { fn: 0,     mw: 183.48, ft: 174.94, ww: 0,   bs: 0 },
  'AWP | Corticera':                 { fn: 450,   mw: 45.85, ft: 33.89, ww: 0,     bs: 0 },
  'AWP | Pink DDPAT':                { fn: 579.28, mw: 150.61, ft: 54.39, ww: 50,  bs: 53.09 },
  'AWP | Elite Build':               { fn: 516.12, mw: 61.91, ft: 20.70, ww: 19.36, bs: 20.99 },
  'AWP | Sun in Leo':                { fn: 108.75, mw: 40.55, ft: 29.96, ww: 30.71, bs: 30.87 },
  'AWP | POP AWP':                   { fn: 72.24, mw: 15,    ft: 12.95, ww: 13.22, bs: 0 },
  'AWP | Snake Camo':                { fn: 542,   mw: 141.07, ft: 94.53, ww: 134.40, bs: 120 },
  'AWP | Silk Tiger':                { fn: 1600.37, mw: 573.28, ft: 475.38, ww: 1371.98, bs: 357.60 },
  'AWP | LongDog':                   { fn: 0,     mw: 543.30, ft: 275.62, ww: 125,  bs: 101.86 },
  'AWP | Queen\'s Gambit':           { fn: 1065.87, mw: 340,  ft: 169,   ww: 116.51, bs: 113.59 },
  'AWP | The End':                   { fn: 191.39, mw: 53.54, ft: 37.30, ww: 38.10, bs: 35.79 },
  'AWP | CMYK':                      { fn: 0,     mw: 925,   ft: 532.56, ww: 362.39, bs: 227.24 },
  'AWP | Pit Viper':                 { fn: 0,     mw: 2.39,  ft: 1.28,  ww: 1.80,  bs: 1.26 },
  'AWP | Capillary':                 { fn: 33.20, mw: 1.44,  ft: 0.87,  ww: 1.33,  bs: 0.80 },
  'AWP | Black Nile':                { fn: 41.71, mw: 8.45,  ft: 5.10,  ww: 5.34,  bs: 5.49 },
  'AWP | Exoskeleton':               { fn: 84.38, mw: 19.92, ft: 6.95,  ww: 6.74,  bs: 6.14 },
  'AWP | Exothermic':                { fn: 38.24, mw: 16.92, ft: 9.79,  ww: 11.63, bs: 7.90 },
  'AWP | Green Energy':              { fn: 148,   mw: 40.05, ft: 18.79, ww: 17.78, bs: 15.18 },
  'AWP | Ice Coaled':                { fn: 65.93, mw: 23,    ft: 12.15, ww: 9.28,  bs: 7.22 },
  'AWP | Worm God':                  { fn: 9.10,  mw: 4.74,  ft: 3.98,  ww: 4.23,  bs: 0 },
  'AWP | PAW':                       { fn: 10.41, mw: 5.99,  ft: 2.92,  ww: 4.07,  bs: 3 },
  'AWP | Acheron':                   { fn: 8.85,  mw: 2.10,  ft: 0.96,  ww: 1.54,  bs: 0.65 },
  'AWP | Arsenic Spill':             { fn: 2.46,  mw: 1.12,  ft: 0.61,  ww: 0.76,  bs: 0.74 },

  // ========================================================================
  // M4A4 SKINS
  // ========================================================================
  'M4A4 | X-Ray':                    { fn: 20,    mw: 8,     ft: 4,     ww: 3,     bs: 2 },
  'M4A4 | Asiimov':                  { fn: 800,   mw: 500,   ft: 407,   ww: 250,   bs: 111 },
  'M4A4 | Bullet Rain':             { fn: 22,    mw: 8,     ft: 4,     ww: 3,     bs: 2.5 },
  'M4A4 | Griffin':                  { fn: 12,    mw: 4,     ft: 2,     ww: 1.5,   bs: 1 },
  'M4A4 | The Battlestar':          { fn: 10,    mw: 4,     ft: 2,     ww: 1.5,   bs: 1.2 },
  'M4A4 | Desert-Strike':           { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'M4A4 | Royal Paladin':           { fn: 22,    mw: 8,     ft: 4,     ww: 3,     bs: 2 },
  'M4A4 | Evil Daimyo':             { fn: 22,    mw: 10,    ft: 5,     ww: 4.5,   bs: 4 },
  'M4A4 | Neo-Noir':                { fn: 328,   mw: 120,   ft: 55,    ww: 45,    bs: 43 },
  'M4A4 | Zirka':                   { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'M4A4 | Tooth Fairy':             { fn: 10,    mw: 4,     ft: 2,     ww: 1.5,   bs: 1.2 },
  'M4A4 | Etch Lord':               { fn: 22,    mw: 10,    ft: 5,     ww: 4,     bs: 3 },
  'M4A4 | Radiation Hazard':        { fn: 22,    mw: 8,     ft: 4,     ww: 3,     bs: 2 },
  'M4A4 | The Emperor':             { fn: 500,   mw: 200,   ft: 76,    ww: 75,    bs: 76 },
  'M4A4 | Temukau':                 { fn: 164,   mw: 90,    ft: 53,    ww: 45,    bs: 42 },
  'M4A4 | Buzz Kill':               { fn: 902,   mw: 500,   ft: 335,   ww: 335,   bs: 335 },
  'M4A4 | Howl':                    { fn: 7000,  mw: 4500,  ft: 3000,  ww: 2200,  bs: 1800 },
  'M4A4 | Desolate Space':          { fn: 217,   mw: 55,    ft: 21,    ww: 17,    bs: 15 },
  'M4A4 | Urban DDPAT':             { fn: 0,     mw: 0,     ft: 0.14,  ww: 0.14,  bs: 0.12 },
  'M4A4 | Mainframe':               { fn: 0.74,  mw: 0.08,  ft: 0.06,  ww: 0.08,  bs: 0.06 },

  // ========================================================================
  // M4A1-S SKINS
  // ========================================================================
  'M4A1-S | Dark Water':            { fn: 22,    mw: 8,     ft: 4,     ww: 3,     bs: 2.5 },
  'M4A1-S | Bright Water':          { fn: 120,   mw: 80,    ft: 67,    ww: 60,    bs: 50 },
  'M4A1-S | Master Piece':          { fn: 120,   mw: 45,    ft: 22,    ww: 18,    bs: 14 },
  'M4A1-S | Atomic Alloy':          { fn: 368,   mw: 120,   ft: 42,    ww: 43,    bs: 43 },
  'M4A1-S | Cyrex':                 { fn: 269,   mw: 240,   ft: 225,   ww: 235,   bs: 247 },
  'M4A1-S | Hyper Beast':           { fn: 674,   mw: 300,   ft: 145,   ww: 153,   bs: 152 },
  'M4A1-S | Golden Coil':           { fn: 551,   mw: 200,   ft: 85,    ww: 75,    bs: 67 },
  'M4A1-S | Chantico\'s Fire':      { fn: 632,   mw: 300,   ft: 149,   ww: 120,   bs: 93 },
  'M4A1-S | Decimator':             { fn: 18,    mw: 7,     ft: 3.5,   ww: 3,     bs: 2.5 },
  'M4A1-S | Mecha Industries':      { fn: 14,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'M4A1-S | Leaded Glass':          { fn: 18,    mw: 7,     ft: 3.5,   ww: 3,     bs: 2 },
  'M4A1-S | Guardian':              { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'M4A1-S | Printstream':           { fn: 90,    mw: 35,    ft: 18,    ww: 14,    bs: 10 },
  'M4A1-S | Night Terror':          { fn: 12,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'M4A1-S | Player Two':            { fn: 14,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'M4A1-S | Emphorosaur-S':         { fn: 20,    mw: 8,     ft: 4,     ww: 3,     bs: 2.5 },
  'M4A1-S | Black Lotus':           { fn: 65,    mw: 28,    ft: 15,    ww: 12,    bs: 9 },
  'M4A1-S | Hot Rod':               { fn: 1826,  mw: 0,     ft: 0,     ww: 0,     bs: 0 },
  'M4A1-S | Imminent Danger':       { fn: 1800,  mw: 1600,  ft: 1549,  ww: 0,     bs: 0 },
  'M4A1-S | Vaporwave':             { fn: 379,   mw: 150,   ft: 80,    ww: 68,    bs: 63 },

  // ========================================================================
  // USP-S SKINS
  // ========================================================================
  'USP-S | Dark Water':             { fn: 200,   mw: 130,   ft: 106,   ww: 100,   bs: 90 },
  'USP-S | Serum':                  { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'USP-S | Guardian':               { fn: 6,     mw: 2.5,   ft: 1.2,   ww: 1,     bs: 0.8 },
  'USP-S | Kill Confirmed':         { fn: 615,   mw: 250,   ft: 93,    ww: 82,    bs: 72 },
  'USP-S | Neo-Noir':               { fn: 22,    mw: 8,     ft: 4,     ww: 3,     bs: 2.5 },
  'USP-S | Cortex':                 { fn: 14,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'USP-S | Cyrex':                  { fn: 10,    mw: 3.5,   ft: 1.8,   ww: 1.5,   bs: 1.2 },
  'USP-S | Printstream':            { fn: 50,    mw: 20,    ft: 10,    ww: 8,     bs: 6 },
  'USP-S | Flashback':              { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'USP-S | Ticket to Hell':         { fn: 10,    mw: 4,     ft: 2,     ww: 1.5,   bs: 1.2 },
  'USP-S | The Traitor':            { fn: 6,     mw: 2.5,   ft: 1.2,   ww: 1,     bs: 0.8 },
  'USP-S | Jawbreaker':             { fn: 30,    mw: 12,    ft: 6,     ww: 5,     bs: 4 },
  'USP-S | Orion':                  { fn: 338,   mw: 180,   ft: 89,    ww: 150,   bs: 299 },
  'USP-S | Caiman':                 { fn: 272,   mw: 100,   ft: 40,    ww: 35,    bs: 30 },
  'USP-S | Blueprint':              { fn: 126,   mw: 40,    ft: 8,     ww: 7,     bs: 6 },
  'USP-S | Stainless':              { fn: 103,   mw: 30,    ft: 7.66,  ww: 7,     bs: 6.64 },

  // ========================================================================
  // DESERT EAGLE SKINS
  // ========================================================================
  'Desert Eagle | Hypnotic':        { fn: 12,    mw: 10,    ft: 9,     ww: 8,     bs: 7 },
  'Desert Eagle | Cobalt Disruption': { fn: 8,   mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'Desert Eagle | Conspiracy':      { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'Desert Eagle | Golden Koi':      { fn: 25,    mw: 18,    ft: 15,    ww: 13,    bs: 12 },
  'Desert Eagle | Naga':            { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'Desert Eagle | Kumicho Dragon':  { fn: 192,   mw: 70,    ft: 28,    ww: 27,    bs: 27 },
  'Desert Eagle | Directive':       { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'Desert Eagle | Code Red':        { fn: 35,    mw: 15,    ft: 8,     ww: 6,     bs: 5 },
  'Desert Eagle | Mecha Industries': { fn: 10,   mw: 4,     ft: 2,     ww: 1.5,   bs: 1.2 },
  'Desert Eagle | Printstream':     { fn: 122,   mw: 75,    ft: 48,    ww: 47,    bs: 45 },
  'Desert Eagle | Ocean Drive':     { fn: 12,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'Desert Eagle | Blue Ply':        { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Desert Eagle | Oxide Blaze':     { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'Desert Eagle | Sputnik':         { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'Desert Eagle | Blaze':           { fn: 1140,  mw: 0,     ft: 0,     ww: 0,     bs: 0 },

  // ========================================================================
  // GLOCK-18 SKINS
  // ========================================================================
  'Glock-18 | Dragon Tattoo':       { fn: 218,   mw: 0,     ft: 0,     ww: 0,     bs: 0 },
  'Glock-18 | Water Elemental':     { fn: 51,    mw: 30,    ft: 23,    ww: 23,    bs: 23 },
  'Glock-18 | Steel Disruption':    { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'Glock-18 | Twilight Galaxy':     { fn: 1406,  mw: 800,   ft: 525,   ww: 400,   bs: 350 },
  'Glock-18 | Wasteland Rebel':     { fn: 18,    mw: 7,     ft: 3.5,   ww: 3,     bs: 2.5 },
  'Glock-18 | Royal Legion':        { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Glock-18 | Ironwork':            { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'Glock-18 | Off World':           { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Glock-18 | Moonrise':            { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'Glock-18 | Oxide Blaze':         { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Glock-18 | Bullet Queen':        { fn: 6,     mw: 2.5,   ft: 1.2,   ww: 1,     bs: 0.8 },
  'Glock-18 | Vogue':               { fn: 22,    mw: 9,     ft: 5,     ww: 4,     bs: 3 },
  'Glock-18 | Gold Toof':           { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'Glock-18 | Umbral Rabbit':       { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'Glock-18 | Block-18':            { fn: 18,    mw: 7,     ft: 3.5,   ww: 3,     bs: 2.5 },
  'Glock-18 | Bunsen Burner':       { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'Glock-18 | Wraiths':             { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'Glock-18 | Winterized':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Glock-18 | Fade':                { fn: 2500,  mw: 0,     ft: 0,     ww: 0,     bs: 0 },
  'Glock-18 | Candy Apple':         { fn: 3.44,  mw: 2,     ft: 1.40,  ww: 1.20,  bs: 1 },

  // ========================================================================
  // FIVE-SEVEN SKINS
  // ========================================================================
  'Five-SeveN | Case Hardened':     { fn: 18,    mw: 8,     ft: 4,     ww: 3,     bs: 2.5 },
  'Five-SeveN | Kami':              { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'Five-SeveN | Monkey Business':   { fn: 60,    mw: 25,    ft: 15,    ww: 14,    bs: 14 },
  'Five-SeveN | Fowl Play':        { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'Five-SeveN | Hyper Beast':      { fn: 14,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'Five-SeveN | Triumvirate':      { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Five-SeveN | Retrobution':      { fn: 0.6,   mw: 0.25,  ft: 0.12,  ww: 0.1,   bs: 0.08 },
  'Five-SeveN | Angry Mob':        { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'Five-SeveN | Buddy':            { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Five-SeveN | Scrawl':           { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Five-SeveN | Fairy Tale':       { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'Five-SeveN | Hybrid':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Five-SeveN | Copper Galaxy':    { fn: 66,    mw: 35,    ft: 17,    ww: 14,    bs: 12 },

  // ========================================================================
  // P250 SKINS
  // ========================================================================
  'P250 | Sand Dune':               { fn: 3.40,  mw: 0.07,  ft: 0.03,  ww: 0.03,  bs: 0.03 },
  'P250 | Mehndi':                  { fn: 80.45, mw: 31.01, ft: 25.41, ww: 21.85, bs: 23.47 },
  'P250 | See Ya Later':            { fn: 226.39, mw: 144.78, ft: 137.61, ww: 135.20, bs: 135.71 },
  'P250 | Asiimov':                 { fn: 0,     mw: 106.89, ft: 15.61, ww: 15.03, bs: 13.91 },
  'P250 | Nuclear Threat':          { fn: 1134.28, mw: 154.99, ft: 56.76, ww: 58.03, bs: 58.73 },
  'P250 | Undertow':                { fn: 116.45, mw: 41.98, ft: 42,    ww: 0,     bs: 0 },
  'P250 | Muertos':                 { fn: 59.54, mw: 18.44, ft: 17.34, ww: 19.05, bs: 18.63 },
  'P250 | Cartel':                  { fn: 105.47, mw: 23.16, ft: 12.46, ww: 12.50, bs: 12.11 },
  'P250 | Franklin':                { fn: 11.13, mw: 3.40,  ft: 2.10,  ww: 4.84,  bs: 0 },
  'P250 | Whiteout':                { fn: 773.26, mw: 115,   ft: 61.06, ww: 60.22, bs: 57.93 },
  'P250 | Hive':                    { fn: 24.64, mw: 4.29,  ft: 3.99,  ww: 0,     bs: 0 },
  'P250 | Splash':                  { fn: 75.59, mw: 30.13, ft: 40.48, ww: 0,     bs: 0 },
  'P250 | Kintsugi':                { fn: 75,    mw: 29.30, ft: 16.99, ww: 13.37, bs: 13.50 },
  'P250 | Crimson Kimono':          { fn: 57.93, mw: 29.56, ft: 21.86, ww: 27.31, bs: 21.31 },
  'P250 | Mint Kimono':             { fn: 34.50, mw: 12.05, ft: 11.63, ww: 15.99, bs: 12.76 },
  'P250 | Bengal Tiger':            { fn: 87.40, mw: 39.24, ft: 27.34, ww: 26.57, bs: 27.83 },
  'P250 | Digital Architect':       { fn: 115.28, mw: 113.59, ft: 79.94, ww: 1545.48, bs: 213 },
  'P250 | Cyber Shell':             { fn: 14.50, mw: 1.47,  ft: 0.77,  ww: 0.74,  bs: 0.76 },
  'P250 | Visions':                 { fn: 28.24, mw: 8.20,  ft: 0,     ww: 5.49,  bs: 4.83 },
  'P250 | Gunsmoke':                { fn: 37.07, mw: 7.31,  ft: 3.12,  ww: 2.46,  bs: 3.08 },
  'P250 | Bone Mask':               { fn: 26.64, mw: 5.76,  ft: 4.19,  ww: 4.34,  bs: 4.66 },
  'P250 | Boreal Forest':           { fn: 3.62,  mw: 0.06,  ft: 0.03,  ww: 0.03,  bs: 0.03 },
  'P250 | Iron Clad':               { fn: 20.33, mw: 0.85,  ft: 0.62,  ww: 0.49,  bs: 0.48 },
  'P250 | Valence':                 { fn: 5.09,  mw: 0.70,  ft: 0.37,  ww: 0.41,  bs: 0.27 },
  'P250 | Red Rock':                { fn: 73.69, mw: 66.61, ft: 39.96, ww: 29.90, bs: 28.13 },
  'P250 | Epicenter':               { fn: 62.81, mw: 17.25, ft: 7.72,  ww: 7.52,  bs: 6.83 },
  'P250 | Dark Filigree':           { fn: 31.87, mw: 9.77,  ft: 8.07,  ww: 8.97,  bs: 8.69 },
  'P250 | Facets':                   { fn: 128.89, mw: 10.48, ft: 5.17, ww: 6.75,  bs: 6.60 },
  'P250 | Apep\'s Curse':           { fn: 366.40, mw: 231.67, ft: 123.98, ww: 108.79, bs: 93.26 },
  'P250 | Modern Hunter':           { fn: 0,     mw: 52.14, ft: 37.05, ww: 61.73, bs: 91.37 },
  'P250 | Black & Tan':             { fn: 45,    mw: 30.38, ft: 28.36, ww: 57.40, bs: 38.24 },
  'P250 | Supernova':               { fn: 9.80,  mw: 2.88,  ft: 2.76,  ww: 2.90,  bs: 0 },
  'P250 | X-Ray':                   { fn: 1.52,  mw: 0.73,  ft: 0.66,  ww: 0,     bs: 0 },
  'P250 | Contamination':           { fn: 19.87, mw: 9.17,  ft: 5.30,  ww: 3.99,  bs: 4.06 },
  'P250 | Inferno':                 { fn: 23.98, mw: 2.16,  ft: 0.89,  ww: 1.10,  bs: 0.89 },
  'P250 | Vino Primo':              { fn: 62.99, mw: 4.89,  ft: 1.58,  ww: 1.06,  bs: 0.90 },
  'P250 | Wingshot':                { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'P250 | Contaminant':             { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },

  // ========================================================================
  // P2000 SKINS
  // ========================================================================
  'P2000 | Corticera':              { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'P2000 | Ocean Foam':             { fn: 55,    mw: 45,    ft: 40,    ww: 38,    bs: 35 },
  'P2000 | Fire Elemental':         { fn: 14,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'P2000 | Pulse':                  { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'P2000 | Handgun':                { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'P2000 | Imperial Dragon':        { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'P2000 | Wicked Sick':            { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'P2000 | Acid Etched':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'P2000 | Lifted Spirits':         { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // P90 SKINS
  // ========================================================================
  'P90 | Death by Kitty':           { fn: 350,   mw: 200,   ft: 132,   ww: 120,   bs: 100 },
  'P90 | Trigon':                   { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'P90 | Asiimov':                  { fn: 12,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'P90 | Emerald Dragon':           { fn: 500,   mw: 300,   ft: 183,   ww: 200,   bs: 299 },
  'P90 | Shapewood':                { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'P90 | Elite Build':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'P90 | Module':                   { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'P90 | Chopper':                  { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'P90 | Traction':                 { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'P90 | Freight':                  { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'P90 | Neoqueen':                 { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'P90 | Nostalgia':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'P90 | Fallout Warning':          { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'P90 | Storm':                    { fn: 29,    mw: 10,    ft: 2.60,  ww: 2.6,   bs: 2.68 },

  // ========================================================================
  // FAMAS SKINS
  // ========================================================================
  'FAMAS | Spitfire':               { fn: 45,    mw: 18,    ft: 10,    ww: 8,     bs: 6 },
  'FAMAS | Hexane':                 { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'FAMAS | Afterimage':             { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'FAMAS | Djinn':                  { fn: 283,   mw: 80,    ft: 17,    ww: 15,    bs: 14 },
  'FAMAS | Valence':                { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'FAMAS | Roll Cage':              { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'FAMAS | Eye of Athena':          { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'FAMAS | Commemoration':          { fn: 22,    mw: 9,     ft: 5,     ww: 4,     bs: 3 },
  'FAMAS | Rapid Eye Movement':     { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'FAMAS | ZX Spectron':            { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },

  // ========================================================================
  // GALIL AR SKINS
  // ========================================================================
  'Galil AR | Orange DDPAT':        { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Galil AR | Blue Titanium':       { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Galil AR | Cerberus':            { fn: 14,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'Galil AR | Chatterbox':          { fn: 35,    mw: 14,    ft: 7,     ww: 5,     bs: 4 },
  'Galil AR | Stone Cold':          { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Galil AR | Kami':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Galil AR | Firefight':           { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'Galil AR | Crimson Tsunami':     { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Galil AR | Chromatic Aberration': { fn: 5,    mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'Galil AR | Connexion':           { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Galil AR | Akoben':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Galil AR | Rocket Pop':          { fn: 28,    mw: 8,     ft: 1.49,  ww: 1,     bs: 0.73 },

  // ========================================================================
  // SG 553 SKINS
  // ========================================================================
  'SG 553 | Ultraviolet':           { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'SG 553 | Pulse':                 { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'SG 553 | Wave Spray':            { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'SG 553 | Cyrex':                 { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'SG 553 | Triarch':               { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'SG 553 | Atlas':                 { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'SG 553 | Danger Close':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'SG 553 | Colony IV':             { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'SG 553 | Dragon Tech':           { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'SG 553 | Darkwing':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'SG 553 | Cyberforce':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'SG 553 | Ol\' Rusty':            { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },

  // ========================================================================
  // SSG 08 SKINS
  // ========================================================================
  'SSG 08 | Blood in the Water':    { fn: 440,   mw: 250,   ft: 126,   ww: 100,   bs: 80 },
  'SSG 08 | Abyss':                 { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'SSG 08 | Detour':                { fn: 12,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'SSG 08 | Ghost Crusader':        { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'SSG 08 | Dragonfire':            { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'SSG 08 | Mainframe 001':         { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'SSG 08 | Turbo Peek':            { fn: 18,    mw: 7,     ft: 3.5,   ww: 3,     bs: 2.5 },
  'SSG 08 | Dezastre':              { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },

  // ========================================================================
  // AUG SKINS
  // ========================================================================
  'AUG | Wings':                    { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'AUG | Chameleon':                { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'AUG | Stymphalian':              { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'AUG | Momentum':                 { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },

  // ========================================================================
  // SCAR-20 SKINS
  // ========================================================================
  'SCAR-20 | Cyrex':                { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'SCAR-20 | Bloodsport':           { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'SCAR-20 | Blueprint':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'SCAR-20 | Jungle Slipstream':    { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'SCAR-20 | Enforcer':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'SCAR-20 | Assault':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // G3SG1 SKINS
  // ========================================================================
  'G3SG1 | Flux':                   { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'G3SG1 | Orange Crash':           { fn: 0.6,   mw: 0.25,  ft: 0.12,  ww: 0.1,   bs: 0.08 },
  'G3SG1 | Stinger':                { fn: 0.6,   mw: 0.25,  ft: 0.12,  ww: 0.1,   bs: 0.08 },
  'G3SG1 | High Seas':              { fn: 0.6,   mw: 0.25,  ft: 0.12,  ww: 0.1,   bs: 0.08 },
  'G3SG1 | Black Sand':             { fn: 0.6,   mw: 0.25,  ft: 0.12,  ww: 0.1,   bs: 0.08 },

  // ========================================================================
  // MAC-10 SKINS
  // ========================================================================
  'MAC-10 | Neon Rider':            { fn: 12,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'MAC-10 | Malachite':             { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MAC-10 | Lapis Gator':           { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'MAC-10 | Pipe Down':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAC-10 | Whitefish':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAC-10 | Monkeyflage':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAC-10 | Saddler':               { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAC-10 | Toybox':                { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'MAC-10 | Light Box':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // MP7 SKINS
  // ========================================================================
  'MP7 | Skulls':                   { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP7 | Ocean Foam':               { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP7 | Anodized Navy':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MP7 | Nemesis':                  { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'MP7 | Armor Core':               { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP7 | Special Delivery':         { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP7 | Aero':                     { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MP7 | Powercore':                { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP7 | Bloodsport':               { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },

  // ========================================================================
  // MP9 SKINS
  // ========================================================================
  'MP9 | Hypnotic':                 { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP9 | Dart':                     { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MP9 | Rose Iron':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MP9 | Airlock':                  { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MP9 | Goo':                      { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MP9 | Hydra':                    { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'MP9 | Food Chain':               { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP9 | Mount Fuji':               { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'MP9 | Starlight Protector':      { fn: 18,    mw: 7,     ft: 3.5,   ww: 3,     bs: 2.5 },

  // ========================================================================
  // MP5-SD SKINS
  // ========================================================================
  'MP5-SD | Gauss':                 { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MP5-SD | Phosphor':              { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'MP5-SD | Acid Wash':             { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'MP5-SD | Kitbash':               { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MP5-SD | Liquidation':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // UMP-45 SKINS
  // ========================================================================
  'UMP-45 | Caramel':               { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'UMP-45 | Labyrinth':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'UMP-45 | Primal Saber':          { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'UMP-45 | Scaffold':              { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'UMP-45 | Arctic Wolf':           { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'UMP-45 | Plastique':             { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'UMP-45 | Motorized':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'UMP-45 | Wild Child':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // PP-BIZON SKINS
  // ========================================================================
  'PP-Bizon | Antique':             { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'PP-Bizon | Water Sigil':         { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'PP-Bizon | Osiris':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'PP-Bizon | Judgement of Anubis': { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'PP-Bizon | Fuel Rod':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'PP-Bizon | High Roller':         { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'PP-Bizon | Harvester':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'PP-Bizon | Embargo':             { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'PP-Bizon | Runic':               { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'PP-Bizon | Space Cat':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // TEC-9 SKINS
  // ========================================================================
  'Tec-9 | Blue Titanium':          { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Tec-9 | Sandstorm':              { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Tec-9 | Isaac':                  { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'Tec-9 | Re-Entry':               { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Tec-9 | Avalanche':              { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'Tec-9 | Ice Cap':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Tec-9 | Flash Out':              { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Tec-9 | Fubar':                  { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Tec-9 | Bamboozle':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Tec-9 | Decimator':              { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'Tec-9 | Brother':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Tec-9 | Rebel':                  { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Tec-9 | Slag':                   { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // CZ75-AUTO SKINS
  // ========================================================================
  'CZ75-Auto | Victoria':           { fn: 22,    mw: 8,     ft: 4,     ww: 3,     bs: 2.5 },
  'CZ75-Auto | Tigris':             { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'CZ75-Auto | Fuschia Is Now':     { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'CZ75-Auto | Yellow Jacket':      { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'CZ75-Auto | Pole Position':      { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'CZ75-Auto | Polymer':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'CZ75-Auto | Xiangliu':           { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'CZ75-Auto | Tacticat':           { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'CZ75-Auto | Eco':                { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'CZ75-Auto | Vendetta':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'CZ75-Auto | Distressed':         { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // R8 REVOLVER SKINS
  // ========================================================================
  'R8 Revolver | Fade':             { fn: 50,    mw: 40,    ft: 35,    ww: 32,    bs: 30 },
  'R8 Revolver | Reboot':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'R8 Revolver | Llama Cannon':     { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.5 },
  'R8 Revolver | Skull Crusher':    { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'R8 Revolver | Survivalist':      { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'R8 Revolver | Grip':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'R8 Revolver | Memento':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'R8 Revolver | Crazy 8':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'R8 Revolver | Banana Cannon':    { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },

  // ========================================================================
  // DUAL BERETTAS SKINS
  // ========================================================================
  'Dual Berettas | Marina':         { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Dual Berettas | Black Limba':    { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'Dual Berettas | Urban Shock':    { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Dual Berettas | Cobra Strike':   { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'Dual Berettas | Ventilators':    { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Dual Berettas | Shred':          { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Dual Berettas | Royal Consorts': { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Dual Berettas | Dualing Dragons': { fn: 1,    mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Dual Berettas | Elite 1.6':      { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'Dual Berettas | Balance':        { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Dual Berettas | Tread':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Dual Berettas | Melondrama':     { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // NOVA SKINS
  // ========================================================================
  'Nova | Predator':                { fn: 1.38,  mw: 0.05,  ft: 0.03,  ww: 0.03,  bs: 0.03 },
  'Nova | Hyper Beast':             { fn: 62.58, mw: 26,    ft: 20.28, ww: 19.36, bs: 18.32 },
  'Nova | Koi':                     { fn: 5.08,  mw: 2.85,  ft: 2.79,  ww: 0,     bs: 0 },
  'Nova | Bloomstick':              { fn: 159,   mw: 51.47, ft: 15.30, ww: 21.31, bs: 17.71 },
  'Nova | Antique':                 { fn: 19.70, mw: 13.91, ft: 15.93, ww: 0,     bs: 0 },
  'Nova | Graphite':                { fn: 23.97, mw: 15.96, ft: 0,     ww: 0,     bs: 0 },
  'Nova | Blaze Orange':            { fn: 1332.33, mw: 52.14, ft: 26.06, ww: 34.76, bs: 0 },
  'Nova | Sand Dune':               { fn: 2.50,  mw: 0.06,  ft: 0.03,  ww: 0.04,  bs: 0.03 },
  'Nova | Walnut':                  { fn: 38.27, mw: 8.80,  ft: 4.29,  ww: 3.17,  bs: 2.71 },
  'Nova | Green Apple':             { fn: 20.70, mw: 15.31, ft: 18.55, ww: 0,     bs: 0 },
  'Nova | Rising Skull':            { fn: 15.79, mw: 7.02,  ft: 5.72,  ww: 6.99,  bs: 10.28 },
  'Nova | Tempest':                 { fn: 24.72, mw: 7.99,  ft: 7.15,  ww: 0,     bs: 0 },
  'Nova | Clear Polymer':           { fn: 46.11, mw: 16.63, ft: 6.96,  ww: 4.51,  bs: 4.06 },
  'Nova | Toy Soldier':             { fn: 21,    mw: 3.99,  ft: 1.17,  ww: 0.96,  bs: 0.80 },
  'Nova | Moon in Libra':           { fn: 10.69, mw: 7.83,  ft: 5.80,  ww: 5.74,  bs: 5.55 },
  'Nova | Red Quartz':              { fn: 30.77, mw: 14.72, ft: 12.89, ww: 14.20, bs: 0 },
  'Nova | Baroque Orange':          { fn: 224.79, mw: 163.88, ft: 222.25, ww: 326.11, bs: 0 },
  'Nova | Rust Coat':               { fn: 15.54, mw: 19.74, ft: 9.86,  ww: 6.76,  bs: 5.37 },
  'Nova | Ghost Camo':              { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'Nova | Ranger':                  { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Nova | Gila':                    { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'Nova | Exo':                     { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Nova | Wild Six':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Nova | Plume':                   { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Nova | Dark Sigil':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // MAG-7 SKINS
  // ========================================================================
  'MAG-7 | Memento':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | Bulldozer':              { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'MAG-7 | Heat':                   { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | Cobalt Core':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | Hard Water':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | Sonar':                  { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | Petroglyph':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | SWAG-7':                 { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'MAG-7 | Justice':                { fn: 8,     mw: 3,     ft: 1.5,   ww: 1.2,   bs: 1 },
  'MAG-7 | Monster Call':           { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.6 },
  'MAG-7 | Popdog':                 { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | BI83 Spectrum':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'MAG-7 | Foresight':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // SAWED-OFF SKINS
  // ========================================================================
  'Sawed-Off | The Kraken':         { fn: 6,     mw: 2.5,   ft: 1.2,   ww: 1,     bs: 0.8 },
  'Sawed-Off | Orange DDPAT':       { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Highwayman':         { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Serenity':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Origami':            { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'Sawed-Off | Yorick':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Zander':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Morris':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Black Sand':         { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Apocalypto':         { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Spirit Board':       { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Kiss Love':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Sawed-Off | Analog Input':       { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // XM1014 SKINS
  // ========================================================================
  'XM1014 | Red Python':            { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'XM1014 | Quicksilver':           { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'XM1014 | Tranquility':           { fn: 1.5,   mw: 0.6,   ft: 0.3,   ww: 0.25,  bs: 0.2 },
  'XM1014 | Teclu Burner':          { fn: 3,     mw: 1.2,   ft: 0.6,   ww: 0.5,   bs: 0.4 },
  'XM1014 | Seasons':               { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'XM1014 | Black Tie':             { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'XM1014 | Incinegator':           { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'XM1014 | Ziggy':                 { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'XM1014 | XOXO':                  { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'XM1014 | Zombie Offensive':      { fn: 2,     mw: 0.8,   ft: 0.4,   ww: 0.3,   bs: 0.25 },
  'XM1014 | Irezumi':               { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // NEGEV SKINS
  // ========================================================================
  'Negev | Anodized Navy':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Negev | Desert Strike':          { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Negev | Terrain':                { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'Negev | Loudmouth':              { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Negev | Man-o\'-war':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Negev | Power Loader':           { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Negev | Lionfish':               { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'Negev | dev_texture':            { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // M249 SKINS
  // ========================================================================
  'M249 | Magma':                   { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'M249 | System Lock':             { fn: 0.8,   mw: 0.3,   ft: 0.15,  ww: 0.1,   bs: 0.08 },
  'M249 | Emerald Poison Dart':     { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },
  'M249 | Downtown':                { fn: 1,     mw: 0.4,   ft: 0.2,   ww: 0.15,  bs: 0.1 },

  // ========================================================================
  // ZEUS x27 SKINS
  // ========================================================================
  'Zeus x27 | Olympus':             { fn: 6,     mw: 2.5,   ft: 1.2,   ww: 1,     bs: 0.8 },

  // ========================================================================
  // STICKERS - Katowice 2014 (most valuable stickers in CS2)
  // ========================================================================
  'Sticker | Titan (Holo) | Katowice 2014':           { fn: 65000, mw: 65000, ft: 65000, ww: 65000, bs: 65000 },
  'Sticker | iBUYPOWER (Holo) | Katowice 2014':       { fn: 90000, mw: 90000, ft: 90000, ww: 90000, bs: 90000 },
  'Sticker | Reason Gaming (Holo) | Katowice 2014':   { fn: 12000, mw: 12000, ft: 12000, ww: 12000, bs: 12000 },
  'Sticker | Natus Vincere (Holo) | Katowice 2014':   { fn: 8000,  mw: 8000,  ft: 8000,  ww: 8000,  bs: 8000 },
  'Sticker | Fnatic (Holo) | Katowice 2014':          { fn: 4500,  mw: 4500,  ft: 4500,  ww: 4500,  bs: 4500 },
  'Sticker | Virtus.Pro (Holo) | Katowice 2014':      { fn: 3500,  mw: 3500,  ft: 3500,  ww: 3500,  bs: 3500 },
  'Sticker | NiP | Katowice 2014':                    { fn: 150,   mw: 150,   ft: 150,   ww: 150,   bs: 150 },
  'Sticker | compLexity Gaming | Katowice 2014':      { fn: 120,   mw: 120,   ft: 120,   ww: 120,   bs: 120 },
  'Sticker | LGB eSports | Katowice 2014':            { fn: 200,   mw: 200,   ft: 200,   ww: 200,   bs: 200 },

  // ========================================================================
  // STICKERS - Cologne 2014
  // ========================================================================
  'Sticker | Fnatic (Holo) | Cologne 2014':            { fn: 120,   mw: 120,   ft: 120,   ww: 120,   bs: 120 },
  'Sticker | Natus Vincere (Holo) | Cologne 2014':     { fn: 80,    mw: 80,    ft: 80,    ww: 80,    bs: 80 },
  'Sticker | Virtus.Pro (Holo) | Cologne 2014':        { fn: 50,    mw: 50,    ft: 50,    ww: 50,    bs: 50 },
  'Sticker | NiP (Holo) | Cologne 2014':               { fn: 45,    mw: 45,    ft: 45,    ww: 45,    bs: 45 },
  'Sticker | Team Dignitas (Holo) | Cologne 2014':     { fn: 400,   mw: 400,   ft: 400,   ww: 400,   bs: 400 },
  'Sticker | Cloud9 | Cologne 2014':                   { fn: 15,    mw: 15,    ft: 15,    ww: 15,    bs: 15 },
  'Sticker | LDLC | Cologne 2014':                     { fn: 12,    mw: 12,    ft: 12,    ww: 12,    bs: 12 },
  'Sticker | iBUYPOWER | Cologne 2014':                { fn: 25,    mw: 25,    ft: 25,    ww: 25,    bs: 25 },
  'Sticker | HellRaisers | Cologne 2014':              { fn: 10,    mw: 10,    ft: 10,    ww: 10,    bs: 10 },

  // ========================================================================
  // STICKERS - Katowice 2015
  // ========================================================================
  'Sticker | Fnatic (Holo) | Katowice 2015':           { fn: 40,    mw: 40,    ft: 40,    ww: 40,    bs: 40 },
  'Sticker | Natus Vincere (Holo) | Katowice 2015':    { fn: 35,    mw: 35,    ft: 35,    ww: 35,    bs: 35 },
  'Sticker | Virtus.Pro (Holo) | Katowice 2015':       { fn: 25,    mw: 25,    ft: 25,    ww: 25,    bs: 25 },
  'Sticker | TSM (Holo) | Katowice 2015':              { fn: 22,    mw: 22,    ft: 22,    ww: 22,    bs: 22 },
  'Sticker | EnVyUs (Holo) | Katowice 2015':           { fn: 18,    mw: 18,    ft: 18,    ww: 18,    bs: 18 },
  'Sticker | Cloud9 (Holo) | Katowice 2015':           { fn: 20,    mw: 20,    ft: 20,    ww: 20,    bs: 20 },
  'Sticker | NiP | Katowice 2015':                     { fn: 5,     mw: 5,     ft: 5,     ww: 5,     bs: 5 },
  'Sticker | Keyd Stars | Katowice 2015':              { fn: 4,     mw: 4,     ft: 4,     ww: 4,     bs: 4 },
  'Sticker | Penta Sports | Katowice 2015':            { fn: 4,     mw: 4,     ft: 4,     ww: 4,     bs: 4 },

  // ========================================================================
  // STICKERS - Community Capsule 1
  // ========================================================================
  'Sticker | Crown (Foil)':                            { fn: 2200,  mw: 2200,  ft: 2200,  ww: 2200,  bs: 2200 },
  'Sticker | Headhunter (Foil)':                       { fn: 600,   mw: 600,   ft: 600,   ww: 600,   bs: 600 },
  'Sticker | Howling Dawn':                            { fn: 1500,  mw: 1500,  ft: 1500,  ww: 1500,  bs: 1500 },
  'Sticker | Flammable (Foil)':                        { fn: 200,   mw: 200,   ft: 200,   ww: 200,   bs: 200 },
  'Sticker | Bomb Code':                               { fn: 25,    mw: 25,    ft: 25,    ww: 25,    bs: 25 },
  'Sticker | Headshot Guarantee':                      { fn: 20,    mw: 20,    ft: 20,    ww: 20,    bs: 20 },
  'Sticker | Lucky Cat (Foil)':                        { fn: 15,    mw: 15,    ft: 15,    ww: 15,    bs: 15 },
  'Sticker | Sherry':                                  { fn: 8,     mw: 8,     ft: 8,     ww: 8,     bs: 8 },
  'Sticker | Chicken Lover':                           { fn: 6,     mw: 6,     ft: 6,     ww: 6,     bs: 6 },

  // ========================================================================
  // STICKERS - IEM Rio 2022
  // ========================================================================
  'Sticker | FaZe Clan (Holo) | Rio 2022':             { fn: 3,     mw: 3,     ft: 3,     ww: 3,     bs: 3 },
  'Sticker | NAVI (Holo) | Rio 2022':                  { fn: 3,     mw: 3,     ft: 3,     ww: 3,     bs: 3 },
  'Sticker | Heroic (Holo) | Rio 2022':                { fn: 1.5,   mw: 1.5,   ft: 1.5,   ww: 1.5,   bs: 1.5 },
  'Sticker | Outsiders (Holo) | Rio 2022':             { fn: 1,     mw: 1,     ft: 1,     ww: 1,     bs: 1 },
  'Sticker | Team Liquid (Holo) | Rio 2022':           { fn: 0.8,   mw: 0.8,   ft: 0.8,   ww: 0.8,   bs: 0.8 },
  'Sticker | Cloud9 (Holo) | Rio 2022':                { fn: 0.8,   mw: 0.8,   ft: 0.8,   ww: 0.8,   bs: 0.8 },
  'Sticker | Fnatic | Rio 2022':                       { fn: 0.25,  mw: 0.25,  ft: 0.25,  ww: 0.25,  bs: 0.25 },
  'Sticker | MOUZ | Rio 2022':                         { fn: 0.2,   mw: 0.2,   ft: 0.2,   ww: 0.2,   bs: 0.2 },
  'Sticker | BIG | Rio 2022':                          { fn: 0.2,   mw: 0.2,   ft: 0.2,   ww: 0.2,   bs: 0.2 },

  // ========================================================================
  // SOUVENIR SKINS - Dust II
  // ========================================================================
  'Souvenir AK-47 | Safari Mesh':                     { fn: 80,    mw: 25,    ft: 12,    ww: 8,     bs: 5 },
  'Souvenir M4A4 | Urban DDPAT':                      { fn: 60,    mw: 20,    ft: 10,    ww: 7,     bs: 4 },
  'Souvenir AWP | Safari Mesh':                       { fn: 40,    mw: 12,    ft: 6,     ww: 4,     bs: 3 },
  'Souvenir P250 | Sand Dune':                        { fn: 15,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'Souvenir Nova | Predator':                         { fn: 8,     mw: 3,     ft: 1.5,   ww: 1,     bs: 0.8 },
  'Souvenir Tec-9 | Groundwater':                     { fn: 6,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.5 },
  'Souvenir G3SG1 | Desert Storm':                    { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir XM1014 | Blue Spruce':                    { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir MAC-10 | Palm':                           { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },

  // ========================================================================
  // SOUVENIR SKINS - Mirage
  // ========================================================================
  'Souvenir M4A1-S | Hot Rod':                        { fn: 3500,  mw: 3000,  ft: 2800,  ww: 2600,  bs: 2400 },
  'Souvenir Desert Eagle | Mudder':                   { fn: 35,    mw: 12,    ft: 6,     ww: 4,     bs: 3 },
  'Souvenir Glock-18 | Reactor':                      { fn: 20,    mw: 8,     ft: 4,     ww: 3,     bs: 2 },
  'Souvenir SSG 08 | Acid Fade':                      { fn: 15,    mw: 6,     ft: 3,     ww: 2,     bs: 1.5 },
  'Souvenir MP9 | Hot Rod':                           { fn: 30,    mw: 22,    ft: 18,    ww: 15,    bs: 12 },
  'Souvenir Five-SeveN | Hot Shot':                   { fn: 8,     mw: 3,     ft: 1.5,   ww: 1,     bs: 0.8 },
  'Souvenir MAG-7 | Sand Dune':                       { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir Negev | Army Sheen':                      { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir SG 553 | Waves Perforated':               { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },

  // ========================================================================
  // SOUVENIR SKINS - Inferno
  // ========================================================================
  'Souvenir M4A4 | Radiation Hazard':                 { fn: 60,    mw: 20,    ft: 10,    ww: 7,     bs: 4 },
  'Souvenir AK-47 | Emerald Pinstripe':               { fn: 45,    mw: 15,    ft: 8,     ww: 5,     bs: 3 },
  'Souvenir P250 | Nuclear Threat':                   { fn: 25,    mw: 10,    ft: 5,     ww: 3,     bs: 2 },
  'Souvenir USP-S | Road Rash':                       { fn: 18,    mw: 7,     ft: 3.5,   ww: 2.5,   bs: 2 },
  'Souvenir Five-SeveN | Silver Quartz':              { fn: 8,     mw: 3,     ft: 1.5,   ww: 1,     bs: 0.8 },
  'Souvenir MP7 | Gunsmoke':                          { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.5 },
  'Souvenir Sawed-Off | Snake Camo':                  { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir Tec-9 | Tornado':                         { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir XM1014 | Grassland':                      { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },

  // ========================================================================
  // SOUVENIR SKINS - Nuke
  // ========================================================================
  'Souvenir P90 | Fallout Warning':                   { fn: 35,    mw: 12,    ft: 6,     ww: 4,     bs: 3 },
  'Souvenir USP-S | Nuclear Threat':                  { fn: 40,    mw: 15,    ft: 8,     ww: 5,     bs: 3 },
  'Souvenir Glock-18 | Reactor':                      { fn: 20,    mw: 8,     ft: 4,     ww: 3,     bs: 2 },
  'Souvenir Tec-9 | Nuclear Threat':                  { fn: 10,    mw: 4,     ft: 2,     ww: 1.5,   bs: 1 },
  'Souvenir PP-Bizon | Night Ops':                    { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir MP7 | Army Recon':                        { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir Nova | Nuclear Waste':                    { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },

  // ========================================================================
  // SOUVENIR SKINS - Overpass
  // ========================================================================
  'Souvenir M4A1-S | Master Piece':                   { fn: 5000,  mw: 2000,  ft: 800,   ww: 500,   bs: 300 },
  'Souvenir SSG 08 | Detour':                         { fn: 200,   mw: 80,    ft: 40,    ww: 30,    bs: 20 },
  'Souvenir AUG | Daedalus':                          { fn: 30,    mw: 12,    ft: 6,     ww: 4,     bs: 3 },
  'Souvenir P2000 | Granite Marbleized':              { fn: 12,    mw: 5,     ft: 2.5,   ww: 2,     bs: 1.5 },
  'Souvenir CZ75-Auto | Green Plaid':                 { fn: 5,     mw: 2,     ft: 1,     ww: 0.8,   bs: 0.5 },
  'Souvenir UMP-45 | Scorched':                       { fn: 4,     mw: 1.5,   ft: 0.8,   ww: 0.6,   bs: 0.4 },
  'Souvenir MAG-7 | Storm':                           { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir Sawed-Off | Sage Spray':                  { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },
  'Souvenir MP9 | Storm':                             { fn: 3,     mw: 1,     ft: 0.5,   ww: 0.4,   bs: 0.3 },

  // ========================================================================
  // GLOVES — Real market prices (March 2026)
  // Gloves don't come in FN — only MW/FT/WW/BS (min_float 0.06)
  // ========================================================================
  // Sport Gloves
  "\u2605 Sport Gloves | Pandora's Box":      { fn: 0, mw: 7500,  ft: 3800,  ww: 2200,  bs: 1800 },
  '\u2605 Sport Gloves | Hedge Maze':         { fn: 0, mw: 1800,  ft: 900,   ww: 650,   bs: 550 },
  '\u2605 Sport Gloves | Superconductor':     { fn: 0, mw: 1700,  ft: 850,   ww: 600,   bs: 500 },
  '\u2605 Sport Gloves | Vice':               { fn: 0, mw: 1400,  ft: 700,   ww: 500,   bs: 420 },
  '\u2605 Sport Gloves | Arid':               { fn: 0, mw: 350,   ft: 180,   ww: 130,   bs: 110 },
  '\u2605 Sport Gloves | Omega':              { fn: 0, mw: 500,   ft: 250,   ww: 180,   bs: 150 },
  '\u2605 Sport Gloves | Amphibious':         { fn: 0, mw: 400,   ft: 200,   ww: 150,   bs: 120 },
  '\u2605 Sport Gloves | Bronze Morph':       { fn: 0, mw: 350,   ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Sport Gloves | Scarlet Shamagh':    { fn: 0, mw: 300,   ft: 150,   ww: 110,   bs: 90 },
  '\u2605 Sport Gloves | Nocts':              { fn: 0, mw: 280,   ft: 140,   ww: 100,   bs: 85 },
  '\u2605 Sport Gloves | Slingshot':          { fn: 0, mw: 260,   ft: 130,   ww: 95,    bs: 80 },

  // Specialist Gloves
  '\u2605 Specialist Gloves | Crimson Kimono': { fn: 0, mw: 2800, ft: 1400,  ww: 900,   bs: 700 },
  '\u2605 Specialist Gloves | Emerald Web':    { fn: 0, mw: 1300, ft: 650,   ww: 450,   bs: 380 },
  '\u2605 Specialist Gloves | Fade':           { fn: 0, mw: 2500, ft: 1200,  ww: 800,   bs: 650 },
  '\u2605 Specialist Gloves | Mogul':          { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Specialist Gloves | Foundation':     { fn: 0, mw: 300,  ft: 150,   ww: 110,   bs: 90 },
  '\u2605 Specialist Gloves | Crimson Web':    { fn: 0, mw: 800,  ft: 400,   ww: 280,   bs: 220 },
  '\u2605 Specialist Gloves | Forest DDPAT':   { fn: 0, mw: 200,  ft: 100,   ww: 75,    bs: 60 },
  '\u2605 Specialist Gloves | Buckshot':       { fn: 0, mw: 180,  ft: 90,    ww: 65,    bs: 55 },
  '\u2605 Specialist Gloves | Tiger Strike':   { fn: 0, mw: 450,  ft: 225,   ww: 160,   bs: 130 },
  '\u2605 Specialist Gloves | Marble Fade':    { fn: 0, mw: 1800, ft: 900,   ww: 600,   bs: 480 },
  '\u2605 Specialist Gloves | Lt. Commander':  { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },

  // Driver Gloves
  '\u2605 Driver Gloves | King Snake':         { fn: 0, mw: 1200, ft: 600,   ww: 420,   bs: 350 },
  '\u2605 Driver Gloves | Imperial Plaid':     { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Driver Gloves | Crimson Weave':      { fn: 0, mw: 900,  ft: 450,   ww: 320,   bs: 260 },
  '\u2605 Driver Gloves | Diamondback':        { fn: 0, mw: 400,  ft: 200,   ww: 150,   bs: 120 },
  '\u2605 Driver Gloves | Lunar Weave':        { fn: 0, mw: 1600, ft: 800,   ww: 550,   bs: 450 },
  '\u2605 Driver Gloves | Convoy':             { fn: 0, mw: 250,  ft: 125,   ww: 90,    bs: 75 },
  '\u2605 Driver Gloves | Racing Green':       { fn: 0, mw: 200,  ft: 100,   ww: 75,    bs: 60 },
  '\u2605 Driver Gloves | Overtake':           { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Driver Gloves | Queen Jaguar':       { fn: 0, mw: 500,  ft: 250,   ww: 180,   bs: 150 },
  '\u2605 Driver Gloves | Snow Leopard':       { fn: 0, mw: 450,  ft: 225,   ww: 160,   bs: 130 },
  '\u2605 Driver Gloves | Black Tie':          { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Driver Gloves | Rezan the Red':      { fn: 0, mw: 300,  ft: 150,   ww: 110,   bs: 90 },

  // Hand Wraps
  '\u2605 Hand Wraps | Cobalt Skulls':         { fn: 0, mw: 700,  ft: 350,   ww: 250,   bs: 200 },
  '\u2605 Hand Wraps | Overprint':             { fn: 0, mw: 500,  ft: 250,   ww: 180,   bs: 150 },
  '\u2605 Hand Wraps | Slaughter':             { fn: 0, mw: 600,  ft: 300,   ww: 210,   bs: 175 },
  '\u2605 Hand Wraps | Leather':               { fn: 0, mw: 250,  ft: 125,   ww: 90,    bs: 75 },
  '\u2605 Hand Wraps | Spruce DDPAT':          { fn: 0, mw: 180,  ft: 90,    ww: 65,    bs: 55 },
  '\u2605 Hand Wraps | Badlands':              { fn: 0, mw: 300,  ft: 150,   ww: 110,   bs: 90 },
  '\u2605 Hand Wraps | Duct Tape':             { fn: 0, mw: 200,  ft: 100,   ww: 75,    bs: 60 },
  '\u2605 Hand Wraps | Arboreal':              { fn: 0, mw: 250,  ft: 125,   ww: 90,    bs: 75 },
  '\u2605 Hand Wraps | Giraffe':               { fn: 0, mw: 200,  ft: 100,   ww: 75,    bs: 60 },
  '\u2605 Hand Wraps | Cashmere':              { fn: 0, mw: 300,  ft: 150,   ww: 110,   bs: 90 },
  '\u2605 Hand Wraps | Desert Shamagh':        { fn: 0, mw: 200,  ft: 100,   ww: 75,    bs: 60 },
  '\u2605 Hand Wraps | CAUTION!':              { fn: 0, mw: 400,  ft: 200,   ww: 150,   bs: 120 },

  // Moto Gloves
  '\u2605 Moto Gloves | Spearmint':            { fn: 0, mw: 2800, ft: 1400,  ww: 900,   bs: 700 },
  '\u2605 Moto Gloves | Cool Mint':            { fn: 0, mw: 900,  ft: 450,   ww: 320,   bs: 260 },
  '\u2605 Moto Gloves | Boom!':                { fn: 0, mw: 500,  ft: 250,   ww: 180,   bs: 150 },
  '\u2605 Moto Gloves | Eclipse':              { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Moto Gloves | Transport':            { fn: 0, mw: 250,  ft: 125,   ww: 90,    bs: 75 },
  '\u2605 Moto Gloves | Polygon':              { fn: 0, mw: 400,  ft: 200,   ww: 150,   bs: 120 },
  '\u2605 Moto Gloves | Turtle':               { fn: 0, mw: 300,  ft: 150,   ww: 110,   bs: 90 },
  '\u2605 Moto Gloves | POW!':                 { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Moto Gloves | Finish Line':          { fn: 0, mw: 450,  ft: 225,   ww: 160,   bs: 130 },
  '\u2605 Moto Gloves | Blood Pressure':       { fn: 0, mw: 300,  ft: 150,   ww: 110,   bs: 90 },
  '\u2605 Moto Gloves | Smoke Out':            { fn: 0, mw: 250,  ft: 125,   ww: 90,    bs: 75 },
  '\u2605 Moto Gloves | 3rd Commando Company': { fn: 0, mw: 200,  ft: 100,   ww: 75,    bs: 60 },

  // Hydra Gloves
  '\u2605 Hydra Gloves | Case Hardened':       { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Hydra Gloves | Emerald':             { fn: 0, mw: 600,  ft: 300,   ww: 210,   bs: 175 },
  '\u2605 Hydra Gloves | Rattler':             { fn: 0, mw: 150,  ft: 75,    ww: 55,    bs: 45 },
  '\u2605 Hydra Gloves | Mangrove':            { fn: 0, mw: 130,  ft: 65,    ww: 48,    bs: 40 },

  // Broken Fang Gloves
  '\u2605 Broken Fang Gloves | Yellow-banded': { fn: 0, mw: 250,  ft: 125,   ww: 90,    bs: 75 },
  '\u2605 Broken Fang Gloves | Unhinged':      { fn: 0, mw: 300,  ft: 150,   ww: 110,   bs: 90 },
  '\u2605 Broken Fang Gloves | Needle Point':  { fn: 0, mw: 350,  ft: 175,   ww: 130,   bs: 100 },
  '\u2605 Broken Fang Gloves | Jade':          { fn: 0, mw: 400,  ft: 200,   ww: 150,   bs: 120 },
};

// ============================================================================
// RARITY-BASED FALLBACK PRICES (for any skins not in the database above)
// ============================================================================
const RARITY_FALLBACK_PRICES = {
  'Consumer Grade':  { fn: 0.08,  mw: 0.05,  ft: 0.03,  ww: 0.03,  bs: 0.03 },
  'Industrial Grade': { fn: 0.30, mw: 0.15,  ft: 0.08,  ww: 0.06,  bs: 0.05 },
  'Mil-Spec':        { fn: 2.00,  mw: 0.80,  ft: 0.40,  ww: 0.30,  bs: 0.25 },
  'Restricted':      { fn: 6.00,  mw: 2.50,  ft: 1.20,  ww: 1.00,  bs: 0.80 },
  'Classified':      { fn: 18.00, mw: 7.00,  ft: 3.50,  ww: 2.50,  bs: 2.00 },
  'Covert':          { fn: 50.00, mw: 20.00, ft: 10.00, ww: 8.00,  bs: 6.00 },
  'Rare Special':    { fn: 300.00, mw: 200.00, ft: 150.00, ww: 120.00, bs: 100.00 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map a full wear name to its short key.
 * @param {string} wear - e.g. "Factory New", "Minimal Wear", etc.
 * @returns {string} - "fn", "mw", "ft", "ww", or "bs"
 */
function getWearKey(wear) {
  const map = {
    'Factory New': 'fn',
    'Minimal Wear': 'mw',
    'Field-Tested': 'ft',
    'Well-Worn': 'ww',
    'Battle-Scarred': 'bs',
  };
  return map[wear] || 'ft'; // default to Field-Tested
}

// ============================================================================
// StatTrak prices where the multiplier deviates significantly from 2-3x
// Format: same as SKIN_PRICES {fn, mw, ft, ww, bs}
// ============================================================================
const STATTRAK_PRICES = {
  // AK-47 (real Steam data March 2026)
  'AK-47 | Redline': { fn: 0, mw: 457.78, ft: 98.49, ww: 86.60, bs: 69.14 },
  'AK-47 | Vulcan': { fn: 1111.67, mw: 0, ft: 539.43, ww: 353.07, bs: 266.47 },
  'AK-47 | Case Hardened': { fn: 1419.98, mw: 880.51, ft: 811.53, ww: 654.59, bs: 589.86 },
  'AK-47 | Asiimov': { fn: 917.82, mw: 160.51, ft: 104.95, ww: 120.17, bs: 96.06 },
  'AK-47 | Fuel Injector': { fn: 1852.16, mw: 861.35, ft: 522.71, ww: 410, bs: 286.82 },
  'AK-47 | Neon Rider': { fn: 630, mw: 281.54, ft: 142.48, ww: 131, bs: 127.80 },
  'AK-47 | Head Shot': { fn: 182.69, mw: 65.61, ft: 45.27, ww: 39.96, bs: 37.32 },
  'AK-47 | Nightwish': { fn: 195.33, mw: 101.22, ft: 90, ww: 85.10, bs: 92.88 },
  'AK-47 | Ice Coaled': { fn: 50.43, mw: 28.49, ft: 16.05, ww: 18, bs: 15.20 },
  'AK-47 | Bloodsport': { fn: 584.20, mw: 469.22, ft: 406.70, ww: 496.99, bs: 0 },
  'AK-47 | Aquamarine Revenge': { fn: 487.77, mw: 254.89, ft: 125, ww: 97.24, bs: 91.67 },
  'AK-47 | The Empress': { fn: 585.07, mw: 242.48, ft: 165.40, ww: 143.48, bs: 134.40 },
  'AK-47 | Phantom Disruptor': { fn: 51.48, mw: 29.90, ft: 20.86, ww: 23.74, bs: 19.71 },
  'AK-47 | Elite Build': { fn: 46.35, mw: 13.31, ft: 7.99, ww: 7.08, bs: 6.74 },
  'AK-47 | Slate': { fn: 63.73, mw: 29.99, ft: 22, ww: 17.29, bs: 17.25 },
  'AK-47 | Point Disarray': { fn: 145.02, mw: 76.45, ft: 47.19, ww: 50.63, bs: 49.38 },
  'AK-47 | Frontside Misty': { fn: 220.13, mw: 84, ft: 54.88, ww: 54.60, bs: 49.83 },
  'AK-47 | Wasteland Rebel': { fn: 0, mw: 260.68, ft: 150.46, ww: 209.91, bs: 160.51 },
  'AK-47 | Jaguar': { fn: 1333.33, mw: 502.16, ft: 266.83, ww: 225.93, bs: 215.59 },
  'AK-47 | Red Laminate': { fn: 0, mw: 325, ft: 208.54, ww: 214.33, bs: 266.47 },
  'AK-47 | Cartel': { fn: 159.55, mw: 72.33, ft: 57, ww: 74.81, bs: 64.21 },
  'AK-47 | Neon Revolution': { fn: 309.75, mw: 150, ft: 133.23, ww: 145.05, bs: 138.97 },
  'AK-47 | Legion of Anubis': { fn: 93.29, mw: 56.76, ft: 53.29, ww: 55.20, bs: 52.97 },
  'AK-47 | Inheritance': { fn: 471.50, mw: 232.90, ft: 146.55, ww: 132.85, bs: 111.23 },
  'AK-47 | Orbit Mk01': { fn: 150.61, mw: 93.26, ft: 73.96, ww: 95.07, bs: 71.35 },
  'AK-47 | Searing Rage': { fn: 71.59, mw: 26.64, ft: 0, ww: 12.67, bs: 13.46 },
  'AK-47 | Crane Flight': { fn: 540.50, mw: 188.55, ft: 132.43, ww: 71, bs: 65.06 },
  'AK-47 | The Oligarch': { fn: 1125.66, mw: 375.97, ft: 185.21, ww: 110.06, bs: 102 },
  'AK-47 | Leet Museo': { fn: 521.34, mw: 245.07, ft: 162.24, ww: 161.20, bs: 139 },
  'AK-47 | Blue Laminate': { fn: 74.09, mw: 48.50, ft: 43.53, ww: 68, bs: 0 },
  'AK-47 | Rat Rod': { fn: 72.41, mw: 28.49, ft: 17.29, ww: 17.07, bs: 17.65 },
  'AK-47 | The Outsiders': { fn: 153.88, mw: 52.55, ft: 29, ww: 27.60, bs: 30.78 },
  'AK-47 | Uncharted': { fn: 9.28, mw: 5.26, ft: 4.32, ww: 5.57, bs: 4.19 },

  // AWP
  'AWP | Asiimov': { fn: 0, mw: 0, ft: 366.33, ww: 285.23, bs: 202.77 },
  'AWP | Hyper Beast': { fn: 396, mw: 185.18, ft: 92.39, ww: 84.56, bs: 81.49 },
  'AWP | Redline': { fn: 0, mw: 214.31, ft: 118.46, ww: 157.75, bs: 0 },
  'AWP | Lightning Strike': { fn: 1458.90, mw: 0, ft: 0, ww: 0, bs: 0 },
  'AWP | BOOM': { fn: 1208.58, mw: 289.63, ft: 283.85, ww: 0, bs: 0 },
  'AWP | Graphite': { fn: 529, mw: 493.90, ft: 0, ww: 0, bs: 0 },
  'AWP | Electric Hive': { fn: 158.50, mw: 101.68, ft: 79.94, ww: 92, bs: 0 },
  'AWP | Neo-Noir': { fn: 128.76, mw: 92.71, ft: 79.94, ww: 85.74, bs: 84.69 },
  'AWP | Printstream': { fn: 773.23, mw: 225.93, ft: 133.23, ww: 96.55, bs: 94.39 },
  'AWP | Wildfire': { fn: 481.56, mw: 219.54, ft: 129.76, ww: 161.87, bs: 127.54 },
  'AWP | Containment Breach': { fn: 1504.97, mw: 565.69, ft: 253.09, ww: 170.83, bs: 160.51 },
  'AWP | Oni Taiji': { fn: 1692.65, mw: 1466.90, ft: 652.69, ww: 690, bs: 568 },
  'AWP | Chrome Cannon': { fn: 293.80, mw: 95, ft: 58.03, ww: 50.09, bs: 51.75 },
  'AWP | Fever Dream': { fn: 53.29, mw: 37.05, ft: 31.18, ww: 32.09, bs: 30.87 },
  'AWP | Atheris': { fn: 57.39, mw: 24.27, ft: 14.79, ww: 12.95, bs: 13.48 },
  'AWP | Chromatic Aberration': { fn: 70.97, mw: 43.38, ft: 35.97, ww: 41.37, bs: 35.70 },
  'AWP | Duality': { fn: 37.10, mw: 16.47, ft: 9, ww: 12.25, bs: 8.99 },
  'AWP | Mortis': { fn: 26.64, mw: 15.30, ft: 11.01, ww: 13, bs: 11.34 },
  'AWP | Elite Build': { fn: 166.77, mw: 67.34, ft: 39.04, ww: 34.46, bs: 40.52 },
  'AWP | Man-o\'-war': { fn: 0, mw: 185.39, ft: 196.95, ww: 0, bs: 0 },
  'AWP | Corticera': { fn: 218.98, mw: 64.82, ft: 61.03, ww: 0, bs: 0 },
  'AWP | Queen\'s Gambit': { fn: 1827.17, mw: 525.98, ft: 241.77, ww: 150.07, bs: 160 },
  'AWP | Ice Coaled': { fn: 110, mw: 47.15, ft: 26, ww: 18.60, bs: 19.63 },
};

// ============================================================================
// Souvenir prices (averaged across sticker combos - these vary wildly by tournament/team)
// ============================================================================
const SOUVENIR_PRICES = {
  // AK-47 Souvenirs
  'AK-47 | Safari Mesh': { fn: 532.94, mw: 30.87, ft: 18.18, ww: 22.97, bs: 22.65 },
  'AK-47 | Steel Delta': { fn: 30.60, mw: 10.52, ft: 7.03, ww: 15.61, bs: 9.23 },
  'AK-47 | Safety Net': { fn: 93.54, mw: 33.35, ft: 23.16, ww: 38.29, bs: 28.40 },
  'AK-47 | Green Laminate': { fn: 46.62, mw: 25.31, ft: 23, ww: 50.75, bs: 0 },
  'AK-47 | Black Laminate': { fn: 0, mw: 98.99, ft: 49.34, ww: 53.53, bs: 47.42 },
  'AK-47 | Panthera onca': { fn: 1199.10, mw: 310, ft: 180, ww: 180, bs: 175.95 },
  'AK-47 | B the Monster': { fn: 0, mw: 869.93, ft: 403, ww: 505.86, bs: 251.33 },

  // AWP Souvenirs
  'AWP | Safari Mesh': { fn: 0, mw: 308.70, ft: 266.47, ww: 370.43, bs: 0 },
  'AWP | Acheron': { fn: 45, mw: 12.44, ft: 8.40, ww: 17.90, bs: 9.75 },
  'AWP | Black Nile': { fn: 42.55, mw: 17.25, ft: 11.15, ww: 25.32, bs: 15.47 },
  'AWP | Pink DDPAT': { fn: 0, mw: 86.89, ft: 33.96, ww: 33.30, bs: 28.55 },
  'AWP | Crakow!': { fn: 608.90, mw: 133.23, ft: 77.28, ww: 72.84, bs: 72.91 },
  'AWP | LongDog': { fn: 0, mw: 984.78, ft: 410, ww: 257.10, bs: 222.66 },
  'AWP | Desert Hydra': { fn: 0, mw: 0, ft: 0, ww: 1885.02, bs: 1790.43 },

  // P250 Souvenirs
  'P250 | Sand Dune': { fn: 185.39, mw: 5.79, ft: 1.15, ww: 2.54, bs: 1.23 },
  'P250 | Facility Draft': { fn: 0.11, mw: 0.05, ft: 0.03, ww: 0.07, bs: 0.10 },
  'P250 | Bone Mask': { fn: 17.40, mw: 0.85, ft: 0.46, ww: 1.11, bs: 0.58 },
  'P250 | Gunsmoke': { fn: 71.85, mw: 7.38, ft: 2.66, ww: 3.62, bs: 3.25 },
  'P250 | Nuclear Threat': { fn: 0, mw: 369.58, ft: 172.64, ww: 0, bs: 295.49 },
  'P250 | Vino Primo': { fn: 140, mw: 22.65, ft: 11, ww: 12.33, bs: 10.50 },

  // Nova Souvenirs
  'Nova | Predator': { fn: 12.42, mw: 0.60, ft: 0.20, ww: 0.93, bs: 0.42 },
  'Nova | Sand Dune': { fn: 0, mw: 37.69, ft: 15.30, ww: 54.63, bs: 13 },
  'Nova | Walnut': { fn: 35.73, mw: 2.04, ft: 0.70, ww: 0.83, bs: 0.83 },
  'Nova | Green Apple': { fn: 13.22, mw: 8, ft: 6.30, ww: 0, bs: 0 },
  'Nova | Candy Apple': { fn: 287.92, mw: 140, ft: 0, ww: 0, bs: 0 },
};

/**
 * Get the exact price for a skin name + wear combination.
 * Checks real StatTrak/Souvenir price data first, then falls back to multipliers.
 * Falls back to rarity-based pricing if the skin is not in the database.
 *
 * @param {string} skinName - Full skin name, e.g. "AK-47 | Redline" or "StatTrak AK-47 | Redline"
 * @param {string} [wear='Field-Tested'] - Wear condition name
 * @param {string} [rarity] - Optional rarity for fallback pricing
 * @returns {number} Price in USD
 */
// ========================== LOAD prices.json (from scraper script) ==========================
const PRICES_JSON_PATH = path.join(__dirname, 'prices.json');
let _pricesJsonCache = null;
let _pricesJsonMtime = 0;

function loadPricesJson() {
  try {
    const stat = fs.statSync(PRICES_JSON_PATH);
    if (stat.mtimeMs !== _pricesJsonMtime || !_pricesJsonCache) {
      _pricesJsonCache = JSON.parse(fs.readFileSync(PRICES_JSON_PATH, 'utf8'));
      _pricesJsonMtime = stat.mtimeMs;
    }
  } catch {
    if (!_pricesJsonCache) _pricesJsonCache = {};
  }
  return _pricesJsonCache;
}

function getPriceFromJson(skinName, wear, variant) {
  const db = loadPricesJson();
  const entry = db[skinName];
  if (!entry) return 0;

  const wearKey = wear || 'Field-Tested';
  if (variant === 'stattrak' && entry.stattrak) {
    const p = entry.stattrak[wearKey];
    if (p && p > 0) return p;
  }
  if (variant === 'souvenir' && entry.souvenir) {
    const p = entry.souvenir[wearKey];
    if (p && p > 0) return p;
  }
  if (variant === 'base' || !variant) {
    const p = entry.base && entry.base[wearKey];
    if (p && p > 0) return p;
  }
  return 0;
}

function getSkinPrice(skinName, wear, rarity) {
  const wk = getWearKey(wear);
  const wearFull = { fn: 'Factory New', mw: 'Minimal Wear', ft: 'Field-Tested', ww: 'Well-Worn', bs: 'Battle-Scarred' }[wk] || wear || 'Field-Tested';

  // Detect variant
  const isStatTrak = /stattrak/i.test(skinName);
  const isSouvenir = /souvenir/i.test(skinName);
  // Strip ALL StatTrak/Souvenir prefixes AND wear suffix
  let baseName = skinName
    .replace(/^stattrak[^a-z]*/i, '')
    .replace(/^souvenir\s*/i, '')
    .replace(/\s*\((?:Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/i, '')
    .trim();

  // ===== PRIORITY 1: prices.json (from scraper — most accurate, freshest) =====
  // Skip prices.json for stickers — bulk APIs return bad sticker prices
  const isSticker = /^sticker\s*\|/i.test(baseName);
  const isGlove = /gloves|wraps/i.test(baseName);
  if (!isSticker && !isGlove) {
    const jsonPrice = getPriceFromJson(
      baseName,
      wearFull,
      isStatTrak ? 'stattrak' : isSouvenir ? 'souvenir' : 'base'
    );
    if (jsonPrice > 0) return jsonPrice;
  }

  // ===== PRIORITY 2: Hardcoded StatTrak/Souvenir tables =====
  if (isStatTrak && STATTRAK_PRICES[baseName]) {
    const stPrice = STATTRAK_PRICES[baseName][wk];
    if (stPrice && stPrice > 0) return stPrice;
  }
  if (isSouvenir && SOUVENIR_PRICES[baseName]) {
    const sovPrice = SOUVENIR_PRICES[baseName][wk];
    if (sovPrice && sovPrice > 0) return sovPrice;
  }

  // ===== PRIORITY 3: Hardcoded SKIN_PRICES =====
  // Try baseName, full skinName, and prefixed variants
  const souvenirKey = isSouvenir ? ('Souvenir ' + baseName) : null;
  const entry = SKIN_PRICES[baseName] || SKIN_PRICES[skinName] || (souvenirKey && SKIN_PRICES[souvenirKey]);
  if (entry) {
    const basePrice = entry[wk] || entry.ft || 0;
    if (basePrice <= 0) return RARITY_FALLBACK_PRICES[rarity] || 1;

    if (isStatTrak) {
      if (basePrice > 500) return Math.round(basePrice * 1.5 * 100) / 100;
      if (basePrice > 100) return Math.round(basePrice * 2.0 * 100) / 100;
      if (basePrice > 20) return Math.round(basePrice * 2.5 * 100) / 100;
      return Math.round(basePrice * 3.0 * 100) / 100;
    }
    if (isSouvenir) {
      if (basePrice > 100) return Math.round(basePrice * 3 * 100) / 100;
      if (basePrice > 10) return Math.round(basePrice * 5 * 100) / 100;
      if (basePrice > 1) return Math.round(basePrice * 15 * 100) / 100;
      return Math.round(basePrice * 50 * 100) / 100;
    }
    return basePrice;
  }

  // ===== PRIORITY 4: Estimate from other conditions in price_cache =====
  // If we have prices for OTHER wears of this same skin, estimate rather than returning $1
  try {
    const { getDb } = require('../db/database');
    const db = getDb();
    if (db) {
      const wears = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];
      const CURVES = {
        knife:  { 'Factory New': 1.00, 'Minimal Wear': 0.92, 'Field-Tested': 0.85, 'Well-Worn': 0.80, 'Battle-Scarred': 0.75 },
        glove:  { 'Factory New': 1.00, 'Minimal Wear': 0.90, 'Field-Tested': 0.80, 'Well-Worn': 0.72, 'Battle-Scarred': 0.65 },
        high:   { 'Factory New': 1.00, 'Minimal Wear': 0.55, 'Field-Tested': 0.35, 'Well-Worn': 0.30, 'Battle-Scarred': 0.28 },
        normal: { 'Factory New': 1.00, 'Minimal Wear': 0.45, 'Field-Tested': 0.25, 'Well-Worn': 0.20, 'Battle-Scarred': 0.18 },
      };
      const isKnife = baseName.includes('\u2605') || baseName.includes('Knife') || baseName.includes('Bayonet') || baseName.includes('Karambit') || baseName.includes('Daggers');
      const isGlove = baseName.includes('Gloves') || baseName.includes('Wraps');
      const curveKey = isKnife ? 'knife' : isGlove ? 'glove' : ['Covert', 'Classified', 'Rare Special'].includes(rarity) ? 'high' : 'normal';
      const curve = CURVES[curveKey];

      // Check price_cache for any other condition of this skin
      const prefix = (isStatTrak ? 'StatTrak\u2122 ' : '') + baseName;
      for (const aw of ['Field-Tested', 'Minimal Wear', 'Factory New', 'Well-Worn', 'Battle-Scarred']) {
        if (aw === wearFull) continue;
        const anchorHash = prefix + ' (' + aw + ')';
        const row = db.prepare('SELECT price_usd FROM price_cache WHERE market_hash_name = ?').get(anchorHash);
        if (row && row.price_usd > 0) {
          const fnEquiv = row.price_usd / curve[aw];
          const estimated = Math.round(fnEquiv * curve[wearFull] * 100) / 100;
          if (estimated > 0) return estimated;
        }
      }
    }
  } catch (e) { /* ignore estimation errors */ }

  // ===== PRIORITY 5: Rarity fallback =====
  return RARITY_FALLBACK_PRICES[rarity] || 1;
}

module.exports = {
  SKIN_PRICES,
  RARITY_FALLBACK_PRICES,
  STATTRAK_PRICES,
  SOUVENIR_PRICES,
  getSkinPrice,
  getWearKey,
};
