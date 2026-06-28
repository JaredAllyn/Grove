'use client'

import { useState, useEffect } from 'react'
import { AiEstimateResult, MealType } from '@/types/nutrition'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const PLACEHOLDERS = [
  'a bowl of oatmeal with banana and honey',
  'two scrambled eggs and a slice of sourdough toast',
  'homemade chicken tikka masala, about 2 cups',
  'large iced coffee with oat milk, no sugar',
  'a handful of mixed nuts and an apple',
]

interface AiEstimatorProps {
  date: string
  onAdded: () => void
}

export default function AiEstimator({ date, onAdded }: AiEstimatorProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiEstimateResult | null>(null)
  const [error, setError] = useState('')
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [mealType, setMealType] = useState<MealType>('lunch')
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length), 4000)
    return () => clearInterval(interval)
  }, [])

  async function handleEstimate() {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: query }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Estimation failed')
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddToLog() {
    if (!result) return
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: foodItem } = await supabase
      .from('food_items')
      .insert({
        name: result.meal_name,
        serving_size_g: 100,
        serving_unit: 'serving',
        nutrients: result.nutrients,
        source: 'ai_estimated',
      })
      .select()
      .single()

    if (foodItem) {
      await supabase.from('food_log_entries').insert({
        user_id: user.id,
        log_date: date,
        meal_type: mealType,
        food_item_id: foodItem.id,
        description: query,
        servings: result.total_servings,
        serving_unit: 'serving',
        nutrients_override: result.nutrients,
        source: 'ai_estimate',
      })
    }

    await supabase.from('ai_estimate_log').insert({
      user_id: user.id,
      prompt_text: query,
      response_json: result,
      confidence: result.confidence,
    })

    setAdding(false)
    setResult(null)
    setQuery('')
    onAdded()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-linen border-t border-stone">
      {result && (
        <div className="max-w-content mx-auto px-6 md:px-10 pt-4">
          <div className="bg-sand border border-stone rounded-card p-4 mb-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-display text-base text-soil">{result.meal_name}</p>
                <p className="text-xs text-bark mt-0.5">{result.notes}</p>
              </div>
              <Badge label={result.confidence} variant={result.confidence} />
            </div>
            <div className="flex gap-4 mb-3">
              <div className="text-center">
                <p className="font-display text-lg text-soil">{Math.round(result.nutrients.calories || 0)}</p>
                <p className="text-xs text-bark">kcal</p>
              </div>
              <div className="text-center">
                <p className="font-display text-lg text-soil">{Math.round(result.nutrients.protein_g || 0)}g</p>
                <p className="text-xs text-bark">protein</p>
              </div>
              <div className="text-center">
                <p className="font-display text-lg text-soil">{Math.round(result.nutrients.carbs_g || 0)}g</p>
                <p className="text-xs text-bark">carbs</p>
              </div>
              <div className="text-center">
                <p className="font-display text-lg text-soil">{Math.round(result.nutrients.fat_g || 0)}g</p>
                <p className="text-xs text-bark">fat</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as MealType)}
                className="text-sm border border-stone rounded-input px-3 py-1.5 bg-linen text-bark focus:outline-none focus:border-clay"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <Button onClick={handleAddToLog} disabled={adding} size="sm">
                {adding ? 'Adding...' : 'Add to log'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-content mx-auto px-6 md:px-10 py-4 flex gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEstimate()}
          placeholder={`e.g. ${PLACEHOLDERS[placeholderIdx]}`}
          className="flex-1 px-4 py-3 bg-sand border border-stone rounded-input text-soil placeholder-stone text-sm focus:outline-none focus:border-clay transition-colors"
          disabled={loading}
        />
        <button
          onClick={handleEstimate}
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-clay text-sand text-sm font-medium rounded-input hover:bg-clay-light transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Estimating...' : 'Estimate'}
        </button>
      </div>
      {error && <p className="px-6 pb-3 text-sm text-rust">{error}</p>}
    </div>
  )
}
