export const CATEGORIES = [
  { id: "mens", name: "Men's", slug: "mens" },
  { id: "womens", name: "Women's", slug: "womens" },
  { id: "accessories", name: "Accessories", slug: "accessories" },
] as const;

export const SUBCATEGORIES: Record<string, { name: string; slug: string }[]> = {
  mens: [
    { name: "Bottoms", slug: "bottoms" },
    { name: "Tops", slug: "tops" },
    { name: "Underwear", slug: "underwear" },
    { name: "Shoes", slug: "shoes" },
  ],
  womens: [
    { name: "Bottoms", slug: "bottoms" },
    { name: "Tops", slug: "tops" },
    { name: "Bras", slug: "bras" },
    { name: "Leggings", slug: "leggings" },
    { name: "Underwear", slug: "underwear" },
    { name: "Bodysuits & Dresses", slug: "bodysuits-dresses" },
    { name: "Shoes", slug: "shoes" },
    { name: "Slides", slug: "slides" },
  ],
  accessories: [
    { name: "Hats", slug: "hats" },
    { name: "Sandals", slug: "sandals" },
    { name: "Slides", slug: "slides" },
    { name: "Bags", slug: "bags" },
  ],
};

export const REGIONS = [
  { id: "north_america", name: "North America (US/Canada)", shortName: "US" },
  { id: "french_canada", name: "French Canada", shortName: "CA-FR" },
  { id: "emea", name: "EMEA", shortName: "EU" },
  { id: "asia_pacific", name: "Asia Pacific", shortName: "APAC" },
] as const;

export const SIZE_SYSTEMS = {
  numeric: ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22"],
  alpha: ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "2X", "3X"],
  dual_alpha: ["XS/S", "S/M", "M/L", "L/XL", "XL/XXL"],
  tri_alpha: ["XXS/XS/S", "XS/S/M", "S/M/L", "M/L/XL", "L/XL/XXL"],
  band: ["28", "30", "32", "34", "36", "38", "40", "42", "44"],
  cup: ["A", "B", "C", "D", "DD", "DDD", "E", "F", "G", "H"],
  shoe_us_mens: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13", "14"],
  shoe_us_womens: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
  shoe_eu: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"],
  shoe_uk: ["3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "11", "12"],
};

export const DEFAULT_MEASUREMENT_COLUMNS: Record<string, string[]> = {
  tops: ["Chest/Bust", "Waist", "Hip", "Shoulder"],
  bottoms: ["Waist", "Hip", "Inseam", "Rise"],
  bras: ["Under Bust", "Bust", "Cup Size"],
  leggings: ["Waist", "Hip", "Inseam"],
  underwear: ["Waist", "Hip"],
  bodysuits: ["Bust", "Waist", "Hip", "Torso Length"],
  shoes: ["Foot Length", "Foot Width"],
  hats: ["Head Circumference"],
};

export const COLUMN_TYPES = [
  { value: "MEASUREMENT", label: "Measurement", description: "Numeric value with unit (inches/cm)" },
  { value: "SIZE_LABEL", label: "Size Label", description: "Text label (XS, S, M, L, 0, 2, 4, etc.)" },
  { value: "REGIONAL_SIZE", label: "Regional Size", description: "Region-specific size (US, EU, UK, etc.)" },
  { value: "BAND_SIZE", label: "Band Size", description: "Bra band size (30, 32, 34, etc.)" },
  { value: "CUP_SIZE", label: "Cup Size", description: "Bra cup size (A, B, C, D, etc.)" },
] as const;

export const MEASUREMENT_UNITS = [
  { value: "INCHES", label: "Inches" },
  { value: "CM", label: "Centimeters" },
  { value: "NONE", label: "None (text only)" },
] as const;
