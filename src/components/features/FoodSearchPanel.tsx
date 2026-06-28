'use client'

import { useState, useEffect, useRef } from 'react'
import { MealType, FoodItem } from '@/types/nutrition'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { scaleNutrients } from '@/lib/nutrients/dailyValues'

interface FoodSearchPanelProps {
  mealType: MealType
  date: string
  onClose: () => void
  onAdded: () => void
}

export default function FoodSearchPanel({ mealType, date, onClose, onAdded }: FoodSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodItem[]>([])
  const [selected, setSelected] = useState<FoodItem | null>(null)
  const [servings, setServings] = useState('1')
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search-food?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.foods || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  async function handleAdd() {
    if (!selected) return
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const servingsNum = parseFloat(servings) || 1
    const scaledNutrients = scaleNutrients(selected.nutrients, servingsNum, selected.serving_size_g)

    await supabase.from('food_log_entries').insert({
      user_id: user.id,
      log_date: date,
      meal_type: mealType,
      food_item_id: selected.id,
      servings: servingsNum,
      serving_unit: selected.serving_unit,
      nutrients_override: scaledNutrients,
      source: 'search',
    })

    setAdding(false)
    onAdded()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
      <div className="absolute inset-0 bg-soil/40" onClick={onClose} />
      <div className="relative bg-linen border border-stone rounded-t-card md:rounded-card w-full md:max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone">
          <h2 className="font-display text-lg text-soil">Add food</h2>
          <button onClick={onClose} className="text-bark hover:text-soil">✕</button>
        </div>

        <div className="px-5 py-4 border-b border-stone">
          <Input
            placeholder="Search foods..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null) }}
            autoFocus
          />
        </div>

        {selected ? (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-4">
              <p className="font-medium text-soil">{selected.name}</p>
              {selected.brand && <p className="text-sm text-bark">{selected.brand}</p>}
              <p className="text-sm text-bark mt-1">
                {Math.round(selected.nutrients.calories || 0)} kcal per {selected.serving_size_g}g
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={servings}
                onChange={e => setServings(e.target.value)}
                min="0.1"
                step="0.1"
                className="w-24"
              />
              <span className="text-sm text-bark">{selected.serving_unit}</span>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleAdd} disabled={adding} className="flex-1">
                {adding ? 'Adding...' : 'Add to log'}
              </Button>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <p className="px-5 py-4 text-sm text-bark">Searching...</p>
            )}
            {!loading && results.length === 0 && query.trim() && (
              <p className="px-5 py-4 text-sm text-stone italic">No results found.</p>
            )}
            {results.map(food => (
              <button
                key={food.id}
                onClick={() => setSelected(food)}
                className="w-full text-left px-5 py-3 border-b border-stone/40 hover:bg-stone/20 transition-colors"
              >
                <p className="text-sm text-soil font-medium">{food.name}</p>
                <p className="text-xs text-bark">
                  {food.brand && `${food.brand} · `}
                  {Math.round(food.nutrients.calories || 0)} kcal per {food.serving_size_g}g
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
