'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { sumNutrients, getDVPercent, DAILY_VALUES } from '@/lib/nutrients/dailyValues'
import { FoodLogEntry, Nutrients } from '@/types/nutrition'
import Card from '@/components/ui/Card'
import NutrientRow from '@/components/ui/NutrientRow'
import Skeleton from '@/components/ui/Skeleton'

const TABS = ['Macros', 'Vitamins', 'Minerals', 'Amino Acids', 'Other'] as const

const MACROS_KEYS: Array<{ key: keyof Nutrients; label: string; unit: string }> = [
  { key: 'calories', label: 'Calories', unit: ' kcal' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'carbs_g', label: 'Carbohydrates', unit: 'g' },
  { key: 'fat_g', label: 'Fat', unit: 'g' },
  { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  { key: 'sugar_g', label: 'Sugar', unit: 'g' },
  { key: 'saturated_fat_g', label: 'Saturated Fat', unit: 'g' },
  { key: 'cholesterol_mg', label: 'Cholesterol', unit: 'mg' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
  { key: 'potassium_mg', label: 'Potassium', unit: 'mg' },
]

const VITAMINS_KEYS: Array<{ key: keyof Nutrients; label: string; unit: string }> = [
  { key: 'vitamin_a_mcg', label: 'Vitamin A', unit: 'mcg' },
  { key: 'vitamin_c_mg', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitamin_d_mcg', label: 'Vitamin D', unit: 'mcg' },
  { key: 'vitamin_e_mg', label: 'Vitamin E', unit: 'mg' },
  { key: 'vitamin_k_mcg', label: 'Vitamin K', unit: 'mcg' },
  { key: 'thiamin_mg', label: 'Thiamin (B1)', unit: 'mg' },
  { key: 'riboflavin_mg', label: 'Riboflavin (B2)', unit: 'mg' },
  { key: 'niacin_mg', label: 'Niacin (B3)', unit: 'mg' },
  { key: 'pantothenic_acid_mg', label: 'Pantothenic Acid (B5)', unit: 'mg' },
  { key: 'vitamin_b6_mg', label: 'Vitamin B6', unit: 'mg' },
  { key: 'folate_mcg', label: 'Folate (B9)', unit: 'mcg' },
  { key: 'vitamin_b12_mcg', label: 'Vitamin B12', unit: 'mcg' },
  { key: 'biotin_mcg', label: 'Biotin (B7)', unit: 'mcg' },
  { key: 'choline_mg', label: 'Choline', unit: 'mg' },
]

const MINERALS_KEYS: Array<{ key: keyof Nutrients; label: string; unit: string }> = [
  { key: 'calcium_mg', label: 'Calcium', unit: 'mg' },
  { key: 'iron_mg', label: 'Iron', unit: 'mg' },
  { key: 'magnesium_mg', label: 'Magnesium', unit: 'mg' },
  { key: 'phosphorus_mg', label: 'Phosphorus', unit: 'mg' },
  { key: 'zinc_mg', label: 'Zinc', unit: 'mg' },
  { key: 'copper_mg', label: 'Copper', unit: 'mg' },
  { key: 'manganese_mg', label: 'Manganese', unit: 'mg' },
  { key: 'selenium_mcg', label: 'Selenium', unit: 'mcg' },
  { key: 'iodine_mcg', label: 'Iodine', unit: 'mcg' },
  { key: 'chromium_mcg', label: 'Chromium', unit: 'mcg' },
  { key: 'fluoride_mg', label: 'Fluoride', unit: 'mg' },
]

const AMINO_KEYS: Array<{ key: keyof Nutrients; label: string; unit: string }> = [
  { key: 'tryptophan_g', label: 'Tryptophan', unit: 'g' },
  { key: 'threonine_g', label: 'Threonine', unit: 'g' },
  { key: 'isoleucine_g', label: 'Isoleucine', unit: 'g' },
  { key: 'leucine_g', label: 'Leucine', unit: 'g' },
  { key: 'lysine_g', label: 'Lysine', unit: 'g' },
  { key: 'methionine_g', label: 'Methionine', unit: 'g' },
  { key: 'phenylalanine_g', label: 'Phenylalanine', unit: 'g' },
  { key: 'valine_g', label: 'Valine', unit: 'g' },
  { key: 'histidine_g', label: 'Histidine', unit: 'g' },
]

const OTHER_KEYS: Array<{ key: keyof Nutrients; label: string; unit: string }> = [
  { key: 'caffeine_mg', label: 'Caffeine', unit: 'mg' },
  { key: 'theobromine_mg', label: 'Theobromine', unit: 'mg' },
]

const TAB_KEYS = {
  Macros: MACROS_KEYS,
  Vitamins: VITAMINS_KEYS,
  Minerals: MINERALS_KEYS,
  'Amino Acids': AMINO_KEYS,
  Other: OTHER_KEYS,
}

export default function NutritionPage() {
  const params = useParams()
  const date = params.date as string
  const [entries, setEntries] = useState<FoodLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Macros')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('food_log_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('log_date', date)
      setEntries((data as FoodLogEntry[]) || [])
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const totals = sumNutrients(entries)

  // suppress unused import warning
  void getDVPercent

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="max-w-content mx-auto">
        <h1 className="font-display text-2xl text-soil mb-2">Nutrition Details</h1>
        <p className="text-bark mb-8">{date}</p>

        <div className="flex gap-1 mb-6 border-b border-stone">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-clay text-clay'
                  : 'border-transparent text-bark hover:text-soil'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Card>
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            TAB_KEYS[activeTab].map(({ key, label, unit }) => {
              const val = (totals[key] as number) || 0
              const dv = DAILY_VALUES[key] as number | undefined
              return (
                <NutrientRow
                  key={key}
                  label={label}
                  nutrientKey={key}
                  amount={val}
                  unit={unit}
                  goal={dv}
                />
              )
            })
          )}
        </Card>
      </div>
    </div>
  )
}
