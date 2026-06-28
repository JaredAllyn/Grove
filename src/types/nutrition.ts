export interface Nutrients {
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  fiber_g?: number
  sugar_g?: number
  saturated_fat_g?: number
  polyunsaturated_fat_g?: number
  monounsaturated_fat_g?: number
  trans_fat_g?: number
  cholesterol_mg?: number
  water_g?: number
  alcohol_g?: number
  omega3_g?: number
  omega6_g?: number
  vitamin_a_mcg?: number
  vitamin_c_mg?: number
  vitamin_d_mcg?: number
  vitamin_e_mg?: number
  vitamin_k_mcg?: number
  thiamin_mg?: number
  riboflavin_mg?: number
  niacin_mg?: number
  pantothenic_acid_mg?: number
  vitamin_b6_mg?: number
  biotin_mcg?: number
  folate_mcg?: number
  vitamin_b12_mcg?: number
  choline_mg?: number
  calcium_mg?: number
  iron_mg?: number
  magnesium_mg?: number
  phosphorus_mg?: number
  potassium_mg?: number
  sodium_mg?: number
  zinc_mg?: number
  copper_mg?: number
  manganese_mg?: number
  selenium_mcg?: number
  chromium_mcg?: number
  iodine_mcg?: number
  molybdenum_mcg?: number
  fluoride_mg?: number
  tryptophan_g?: number
  threonine_g?: number
  isoleucine_g?: number
  leucine_g?: number
  lysine_g?: number
  methionine_g?: number
  phenylalanine_g?: number
  valine_g?: number
  histidine_g?: number
  caffeine_mg?: number
  theobromine_mg?: number
}

export interface FoodItem {
  id: string
  fdc_id?: string
  name: string
  brand?: string
  serving_size_g: number
  serving_unit: string
  nutrients: Nutrients
  source: 'usda' | 'open_food_facts' | 'ai_estimated' | 'user_created'
}

export interface FoodLogEntry {
  id: string
  user_id: string
  log_date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_item_id?: string
  description?: string
  servings: number
  serving_unit: string
  nutrients_override: Nutrients
  source: 'search' | 'ai_estimate' | 'manual'
  food_item?: FoodItem
}

export interface UserGoals {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface AiEstimateResult {
  meal_name: string
  total_servings: number
  confidence: 'high' | 'medium' | 'low'
  notes: string
  ingredients: string[]
  nutrients: Nutrients
}
