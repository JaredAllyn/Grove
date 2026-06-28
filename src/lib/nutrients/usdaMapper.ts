import { Nutrients } from '@/types/nutrition'

const USDA_NUTRIENT_MAP: Record<number, keyof Nutrients> = {
  1008: 'calories',
  1003: 'protein_g',
  1005: 'carbs_g',
  1004: 'fat_g',
  1079: 'fiber_g',
  2000: 'sugar_g',
  1258: 'saturated_fat_g',
  1293: 'polyunsaturated_fat_g',
  1292: 'monounsaturated_fat_g',
  1257: 'trans_fat_g',
  1253: 'cholesterol_mg',
  1051: 'water_g',
  1018: 'alcohol_g',
  1109: 'vitamin_e_mg',
  1106: 'vitamin_a_mcg',
  1162: 'vitamin_c_mg',
  1114: 'vitamin_d_mcg',
  1185: 'vitamin_k_mcg',
  1165: 'thiamin_mg',
  1166: 'riboflavin_mg',
  1167: 'niacin_mg',
  1170: 'pantothenic_acid_mg',
  1175: 'vitamin_b6_mg',
  1176: 'biotin_mcg',
  1177: 'folate_mcg',
  1178: 'vitamin_b12_mcg',
  1180: 'choline_mg',
  1087: 'calcium_mg',
  1089: 'iron_mg',
  1090: 'magnesium_mg',
  1091: 'phosphorus_mg',
  1092: 'potassium_mg',
  1093: 'sodium_mg',
  1095: 'zinc_mg',
  1098: 'copper_mg',
  1101: 'manganese_mg',
  1103: 'selenium_mcg',
  1240: 'chromium_mcg',
  1246: 'iodine_mcg',
  1242: 'molybdenum_mcg',
  1099: 'fluoride_mg',
  1210: 'tryptophan_g',
  1211: 'threonine_g',
  1212: 'isoleucine_g',
  1213: 'leucine_g',
  1214: 'lysine_g',
  1215: 'methionine_g',
  1217: 'phenylalanine_g',
  1219: 'valine_g',
  1221: 'histidine_g',
  1057: 'caffeine_mg',
  1058: 'theobromine_mg',
  1278: 'omega3_g',
  1269: 'omega6_g',
}

interface USDANutrient {
  nutrientId: number
  value: number
}

export function mapUSDANutrients(usdaNutrients: USDANutrient[]): Nutrients {
  const nutrients: Nutrients = {}
  for (const n of usdaNutrients) {
    const key = USDA_NUTRIENT_MAP[n.nutrientId]
    if (key) {
      (nutrients[key] as number) = n.value
    }
  }
  return nutrients
}
