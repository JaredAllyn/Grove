'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { mifflinStJeor } from '@/lib/nutrients/dailyValues'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    display_name: '',
    height_cm: '',
    weight_kg: '',
    birth_year: '',
    activity_level: 'moderate',
    goal_type: 'maintain',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users_profile').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({
          display_name: (data.display_name as string) || '',
          height_cm: data.height_cm?.toString() || '',
          weight_kg: data.weight_kg?.toString() || '',
          birth_year: data.birth_year?.toString() || '',
          activity_level: (data.activity_level as string) || 'moderate',
          goal_type: (data.goal_type as string) || 'maintain',
        })
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('users_profile').upsert({
      id: user.id,
      display_name: profile.display_name,
      height_cm: parseFloat(profile.height_cm) || null,
      weight_kg: parseFloat(profile.weight_kg) || null,
      birth_year: parseInt(profile.birth_year) || null,
      activity_level: profile.activity_level,
      goal_type: profile.goal_type,
    })

    // Compute and save goals
    if (profile.height_cm && profile.weight_kg && profile.birth_year) {
      const goals = mifflinStJeor(
        parseFloat(profile.weight_kg),
        parseFloat(profile.height_cm),
        parseInt(profile.birth_year),
        profile.activity_level,
        profile.goal_type
      )
      await supabase.from('user_goals').upsert({
        user_id: user.id,
        ...goals,
      }, { onConflict: 'user_id' })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-2xl text-soil mb-8">Profile & Goals</h1>

        <Card className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-bark mb-2">Display name</label>
            <Input
              value={profile.display_name}
              onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-bark mb-2">Height (cm)</label>
              <Input
                type="number"
                value={profile.height_cm}
                onChange={e => setProfile(p => ({ ...p, height_cm: e.target.value }))}
                placeholder="170"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-bark mb-2">Weight (kg)</label>
              <Input
                type="number"
                value={profile.weight_kg}
                onChange={e => setProfile(p => ({ ...p, weight_kg: e.target.value }))}
                placeholder="70"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bark mb-2">Birth year</label>
            <Input
              type="number"
              value={profile.birth_year}
              onChange={e => setProfile(p => ({ ...p, birth_year: e.target.value }))}
              placeholder="1990"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bark mb-2">Activity level</label>
            <select
              value={profile.activity_level}
              onChange={e => setProfile(p => ({ ...p, activity_level: e.target.value }))}
              className="w-full px-4 py-3 bg-sand border border-stone rounded-input text-soil focus:outline-none focus:border-clay text-sm"
            >
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="light">Light (1–3 days/week)</option>
              <option value="moderate">Moderate (3–5 days/week)</option>
              <option value="active">Active (6–7 days/week)</option>
              <option value="very_active">Very active (hard exercise daily)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bark mb-2">Goal</label>
            <select
              value={profile.goal_type}
              onChange={e => setProfile(p => ({ ...p, goal_type: e.target.value }))}
              className="w-full px-4 py-3 bg-sand border border-stone rounded-input text-soil focus:outline-none focus:border-clay text-sm"
            >
              <option value="lose">Lose weight</option>
              <option value="maintain">Maintain weight</option>
              <option value="gain">Gain weight</option>
            </select>
          </div>

          <Button onClick={handleSave} disabled={saving} className="self-start">
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
