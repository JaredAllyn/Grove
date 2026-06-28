import { Nutrients, UserGoals } from '@/types/nutrition'

export const DAILY_VALUES: Partial<Nutrients> = {
  calories: 2000,
  protein_g: 50,
  carbs_g: 275,
  fat_g: 78,
  fiber_g: 28,
  sugar_g: 50,
  saturated_fat_g: 20,
  cholesterol_mg: 300,
  sodium_mg: 2300,
  potassium_mg: 4700,
  vitamin_a_mcg: 900,
  vitamin_c_mg: 90,
  vitamin_d_mcg: 20,
  vitamin_e_mg: 15,
  vitamin_k_mcg: 120,
  thiamin_mg: 1.2,
  riboflavin_mg: 1.3,
  niacin_mg: 16,
  pantothenic_acid_mg: 5,
  vitamin_b6_mg: 1.7,
  biotin_mcg: 30,
  folate_mcg: 400,
  vitamin_b12_mcg: 2.4,
  choline_mg: 550,
  calcium_mg: 1300,
  iron_mg: 18,
  magnesium_mg: 420,
  phosphorus_mg: 1250,
  zinc_mg: 11,
  copper_mg: 0.9,
  manganese_mg: 2.3,
  selenium_mcg: 55,
  iodine_mcg: 150,
  chromium_mcg: 35,
  molybdenum_mcg: 45,
  fluoride_mg: 4,
}

export function getDVPercent(nutrientKey: keyof Nutrients, amount: number): number {
  const dv = DAILY_VALUES[nutrientKey]
  if (!dv) return 0
  return Math.round((amount / dv) * 100)
}

export function sumNutrients(entries: Array<{ nutrients_override: Nutrients }>): Nutrients {
  const totals: Nutrients = {}
  for (const entry of entries) {
    const n = entry.nutrients_override
    for (const key of Object.keys(n) as Array<keyof Nutrients>) {
      const val = n[key]
      if (typeof val === 'number') {
        (totals[key] as number) = ((totals[key] as number) || 0) + val
      }
    }
  }
  return totals
}

export function scaleNutrients(nutrients: Nutrients, servings: number, servingSizeG: number, per100g = true): Nutrients {
  const factor = per100g ? (servings * servingSizeG) / 100 : servings
  const scaled: Nutrients = {}
  for (const key of Object.keys(nutrients) as Array<keyof Nutrients>) {
    const val = nutrients[key]
    if (typeof val === 'number') {
      (scaled[key] as number) = Math.round(val * factor * 10) / 10
    }
  }
  return scaled
}

export function mifflinStJeor(
  weightKg: number,
  heightCm: number,
  birthYear: number,
  activityLevel: string,
  goalType: string
): UserGoals {
  const age = new Date().getFullYear() - birthYear
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55)
  const goalAdjustment = goalType === 'lose' ? -500 : goalType === 'gain' ? 300 : 0
  const calories = Math.round(tdee + goalAdjustment)

  return {
    calories,
    protein_g: Math.round((calories * 0.25) / 4),
    carbs_g: Math.round((calories * 0.45) / 4),
    fat_g: Math.round((calories * 0.30) / 9),
    fiber_g: 28,
  }
}
