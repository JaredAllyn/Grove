'use client'

import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

interface RingChartProps {
  consumed: number
  goal: number
  size?: number
}

export default function RingChart({ consumed, goal, size = 160 }: RingChartProps) {
  const pct = Math.min((consumed / goal) * 100, 100)
  const isOver = consumed > goal

  const data = [
    { value: 100, fill: '#EDE7DA' },
    { value: pct, fill: isOver ? '#B85C38' : '#A0522D' },
  ]

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="90%"
          barSize={12}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl text-soil font-semibold">{consumed}</span>
        <span className="text-xs text-bark">/ {goal} kcal</span>
      </div>
    </div>
  )
}
