'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import Card from '@/components/ui/Card'
import MealSection from '@/components/features/MealSection'
import MacroSummary from '@/components/features/MacroSummary'
import AiEstimator from '@/components/features/AiEstimator'
import RingChart from '@/components/ui/RingChart'
import { FoodLogEntry, MealType, UserGoals, Nutrients } from '@/types/nutrition'
import { createClient } from '@/lib/supabase/client'
import { sumNutrients } from '@/lib/nutrients/dailyValues'
import Skeleton from '@/components/ui/Skeleton'

const DEFAULT_GOALS: UserGoals = {
  calories: 2000,
  protein_g: 150,
  carbs_g: 225,
  fat_g: 67,
  fiber_g: 28,
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function DashboardPage() {
  const [date, setDate] = useState(new Date())
  const [entries, setEntries] = useState<FoodLogEntry[]>([])
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const dateStr = format(date, 'yyyy-MM-dd')

  useEffect(() => {
    loadEntries()
    loadGoals()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr])

  async function loadEntries() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('food_log_entries')
      .select('*, food_item:food_items(*)')
      .eq('user_id', user.id)
      .eq('log_date', dateStr)
      .order('created_at')

    setEntries((data as FoodLogEntry[]) || [])
    setLoading(false)
  }

  async function loadGoals() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) setGoals(data as UserGoals)
  }

  const totals: Nutrients = sumNutrients(entries)

  const entriesByMeal = (meal: MealType) => entries.filter(e => e.meal_type === meal)

  return (
    <div className="flex flex-col min-h-screen pb-36">
      {/* Date nav */}
      <div className="px-6 md:px-10 py-6 border-b border-stone flex items-center gap-4">
        <button
          onClick={() => setDate(subDays(date, 1))}
          className="text-bark hover:text-clay transition-colors"
        >
          ←
        </button>
        <h1 className="font-display text-xl text-soil">
          {format(date, 'EEEE, MMMM d')}
          {format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
            <span className="ml-2 text-sm font-sans text-clay">Today</span>
          )}
        </h1>
        <button
          onClick={() => setDate(addDays(date, 1))}
          className="text-bark hover:text-clay transition-colors"
          disabled={dateStr >= format(new Date(), 'yyyy-MM-dd')}
        >
          →
        </button>
      </div>

      <div className="flex-1 px-6 md:px-10 py-8">
        <div className="max-w-content mx-auto flex flex-col md:flex-row gap-8">
          {/* Left: meal sections */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-card" />
              ))
            ) : (
              MEAL_TYPES.map(meal => (
                <MealSection
                  key={meal}
                  mealType={meal}
                  entries={entriesByMeal(meal)}
                  date={dateStr}
                  onUpdate={loadEntries}
                />
              ))
            )}
          </div>

          {/* Right: summary */}
          <div className="md:w-72 shrink-0 flex flex-col gap-4">
            <Card className="flex flex-col items-center gap-4">
              <h2 className="font-display text-lg text-soil self-start">Calories</h2>
              {loading ? (
                <Skeleton className="w-40 h-40 rounded-full" />
              ) : (
                <RingChart consumed={Math.round(totals.calories || 0)} goal={goals.calories} />
              )}
            </Card>

            <Card>
              <h2 className="font-display text-lg text-soil mb-4">Macros</h2>
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-8" />)}
                </div>
              ) : (
                <MacroSummary totals={totals} goals={goals} />
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* AI estimator bar */}
      <AiEstimator date={dateStr} onAdded={loadEntries} />
    </div>
  )
}
