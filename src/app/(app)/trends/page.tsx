'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { subDays, format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import { sumNutrients } from '@/lib/nutrients/dailyValues'
import { FoodLogEntry } from '@/types/nutrition'

export default function TrendsPage() {
  const [data7, setData7] = useState<Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }>>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const startDate = format(subDays(new Date(), 29), 'yyyy-MM-dd')
      const { data: entries } = await supabase
        .from('food_log_entries')
        .select('log_date, nutrients_override')
        .eq('user_id', user.id)
        .gte('log_date', startDate)
        .order('log_date')

      if (!entries) { setLoading(false); return }

      const byDate: Record<string, Array<Pick<FoodLogEntry, 'nutrients_override'>>> = {}
      for (const e of entries) {
        if (!byDate[e.log_date]) byDate[e.log_date] = []
        byDate[e.log_date].push(e as Pick<FoodLogEntry, 'nutrients_override'>)
      }

      const chartData = Object.entries(byDate).map(([date, dayEntries]) => {
        const totals = sumNutrients(dayEntries)
        return {
          date: format(new Date(date), 'MMM d'),
          calories: Math.round(totals.calories || 0),
          protein: Math.round(totals.protein_g || 0),
          carbs: Math.round(totals.carbs_g || 0),
          fat: Math.round(totals.fat_g || 0),
        }
      })

      setData7(chartData)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="max-w-content mx-auto flex flex-col gap-8">
        <h1 className="font-display text-2xl text-soil">Trends</h1>

        <Card>
          <h2 className="font-display text-lg text-soil mb-6">Calorie Intake (30 days)</h2>
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data7}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B4F3A' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B4F3A' }} />
                <Tooltip
                  contentStyle={{ background: '#EDE7DA', border: '1px solid #D4C9B8', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="calories" stroke="#A0522D" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg text-soil mb-6">Macro Breakdown (30 days)</h2>
          {loading ? (
            <Skeleton className="h-48" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data7}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B4F3A' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B4F3A' }} />
                <Tooltip
                  contentStyle={{ background: '#EDE7DA', border: '1px solid #D4C9B8', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="protein" fill="#A0522D" stackId="a" name="Protein (g)" />
                <Bar dataKey="carbs" fill="#C8A96E" stackId="a" name="Carbs (g)" />
                <Bar dataKey="fat" fill="#6B4F3A" stackId="a" name="Fat (g)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
