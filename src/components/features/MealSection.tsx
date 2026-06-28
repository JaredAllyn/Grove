'use client'

import { useState } from 'react'
import { MealType, FoodLogEntry } from '@/types/nutrition'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FoodEntryRow from './FoodEntryRow'
import FoodSearchPanel from './FoodSearchPanel'
import { cn } from '@/lib/utils'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
}

interface MealSectionProps {
  mealType: MealType
  entries: FoodLogEntry[]
  date: string
  onUpdate: () => void
}

export default function MealSection({ mealType, entries, date, onUpdate }: MealSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const totalCals = entries.reduce((sum, e) => sum + (e.nutrients_override?.calories || 0), 0)

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone/10 transition-colors"
        >
          <span className="font-display text-base text-soil">{MEAL_LABELS[mealType]}</span>
          <div className="flex items-center gap-3">
            {totalCals > 0 && (
              <span className="text-sm text-bark">{Math.round(totalCals)} kcal</span>
            )}
            <span className={cn('text-stone transition-transform', collapsed ? '' : 'rotate-180')}>▾</span>
          </div>
        </button>

        {!collapsed && (
          <div className="border-t border-stone">
            {entries.length === 0 ? (
              <p className="px-5 py-4 text-sm text-stone italic">Nothing logged yet</p>
            ) : (
              entries.map(entry => (
                <FoodEntryRow key={entry.id} entry={entry} onUpdate={onUpdate} />
              ))
            )}
            <div className="px-5 py-3 border-t border-stone/50">
              <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)}>
                + Add food
              </Button>
            </div>
          </div>
        )}
      </Card>

      {showSearch && (
        <FoodSearchPanel
          mealType={mealType}
          date={date}
          onClose={() => setShowSearch(false)}
          onAdded={() => { setShowSearch(false); onUpdate() }}
        />
      )}
    </>
  )
}
