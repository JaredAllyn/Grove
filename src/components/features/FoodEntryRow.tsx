'use client'

import { useState } from 'react'
import { FoodLogEntry } from '@/types/nutrition'
import { createClient } from '@/lib/supabase/client'

interface FoodEntryRowProps {
  entry: FoodLogEntry
  onUpdate: () => void
}

export default function FoodEntryRow({ entry, onUpdate }: FoodEntryRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  const name = entry.food_item?.name || entry.description || 'Unknown food'
  const cals = Math.round(entry.nutrients_override?.calories || 0)

  async function handleDelete() {
    await supabase.from('food_log_entries').delete().eq('id', entry.id)
    onUpdate()
    setMenuOpen(false)
  }

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-stone/40 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-soil truncate">{name}</p>
        <p className="text-xs text-bark">
          {entry.servings} {entry.serving_unit}
          {entry.source === 'ai_estimate' && <span className="ml-2 text-clay">· AI</span>}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-bark">{cals} kcal</span>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="text-stone hover:text-bark transition-colors px-1"
          >
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-10 bg-linen border border-stone rounded-card shadow-sm py-1 min-w-28">
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-rust hover:bg-stone/20 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
