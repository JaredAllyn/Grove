import ProgressBar from './ProgressBar'
import { getDVPercent } from '@/lib/nutrients/dailyValues'
import { Nutrients } from '@/types/nutrition'

interface NutrientRowProps {
  label: string
  nutrientKey: keyof Nutrients
  amount: number
  unit: string
  goal?: number
}

export default function NutrientRow({ label, nutrientKey, amount, unit, goal }: NutrientRowProps) {
  const dvPct = getDVPercent(nutrientKey, amount)

  return (
    <div className="py-3 border-b border-stone last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-soil">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-soil">
            {amount % 1 === 0 ? amount : amount.toFixed(1)}{unit}
          </span>
          {goal && (
            <span className="text-xs text-bark">/ {goal}{unit}</span>
          )}
          {dvPct > 0 && (
            <span className="text-xs text-bark w-10 text-right">{dvPct}% DV</span>
          )}
        </div>
      </div>
      {dvPct > 0 && <ProgressBar percent={dvPct} />}
    </div>
  )
}
