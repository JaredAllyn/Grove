import ProgressBar from '@/components/ui/ProgressBar'
import { Nutrients, UserGoals } from '@/types/nutrition'

interface MacroSummaryProps {
  totals: Nutrients
  goals: UserGoals
}

const MACROS = [
  { key: 'protein_g' as keyof Nutrients, label: 'Protein', unit: 'g', goalKey: 'protein_g' as keyof UserGoals },
  { key: 'carbs_g' as keyof Nutrients, label: 'Carbs', unit: 'g', goalKey: 'carbs_g' as keyof UserGoals },
  { key: 'fat_g' as keyof Nutrients, label: 'Fat', unit: 'g', goalKey: 'fat_g' as keyof UserGoals },
  { key: 'fiber_g' as keyof Nutrients, label: 'Fiber', unit: 'g', goalKey: 'fiber_g' as keyof UserGoals },
]

export default function MacroSummary({ totals, goals }: MacroSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      {MACROS.map(({ key, label, unit, goalKey }) => {
        const val = (totals[key] as number) || 0
        const goal = goals[goalKey] as number
        return (
          <div key={key}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-soil">{label}</span>
              <span className="text-sm text-bark">
                {Math.round(val)}{unit} <span className="text-stone">/ {goal}{unit}</span>
              </span>
            </div>
            <ProgressBar value={val} max={goal} />
          </div>
        )
      })}
    </div>
  )
}
