import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapUSDANutrients } from '@/lib/nutrients/usdaMapper'
import { FoodItem } from '@/types/nutrition'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  if (!query?.trim()) return NextResponse.json({ foods: [] })

  const supabase = await createClient()

  // Check cache first
  const { data: cached } = await supabase
    .from('food_items')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (cached && cached.length >= 5) {
    return NextResponse.json({ foods: cached })
  }

  const foods: FoodItem[] = (cached as FoodItem[]) || []

  // USDA search
  try {
    const usdaKey = process.env.USDA_API_KEY || 'DEMO_KEY'
    const usdaRes = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy,Branded&pageSize=15&api_key=${usdaKey}`
    )
    if (usdaRes.ok) {
      const usdaData = await usdaRes.json()
      for (const food of usdaData.foods || []) {
        const existing = foods.find(f => f.fdc_id === String(food.fdcId))
        if (existing) continue

        const nutrients = mapUSDANutrients(
          (food.foodNutrients || []).map((n: { nutrientId: number; value: number }) => ({
            nutrientId: n.nutrientId,
            value: n.value,
          }))
        )

        const item = {
          fdc_id: String(food.fdcId),
          name: food.description,
          brand: food.brandOwner || food.brandName,
          serving_size_g: food.servingSize || 100,
          serving_unit: food.servingSizeUnit || 'g',
          nutrients,
          source: 'usda' as const,
        }

        // Cache it
        const { data: inserted } = await supabase
          .from('food_items')
          .upsert({ ...item }, { onConflict: 'fdc_id' })
          .select()
          .single()

        if (inserted) foods.push(inserted as FoodItem)
      }
    }
  } catch (err) {
    console.error('USDA search error:', err)
  }

  // Open Food Facts fallback if sparse
  if (foods.length < 5) {
    try {
      const offRes = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`
      )
      if (offRes.ok) {
        const offData = await offRes.json()
        for (const product of offData.products || []) {
          if (!product.product_name) continue
          const n = product.nutriments || {}
          const item = {
            name: product.product_name as string,
            brand: product.brands as string | undefined,
            serving_size_g: parseFloat(product.serving_size) || 100,
            serving_unit: 'g',
            nutrients: {
              calories: n['energy-kcal_100g'] as number | undefined,
              protein_g: n['proteins_100g'] as number | undefined,
              carbs_g: n['carbohydrates_100g'] as number | undefined,
              fat_g: n['fat_100g'] as number | undefined,
              fiber_g: n['fiber_100g'] as number | undefined,
              sugar_g: n['sugars_100g'] as number | undefined,
              sodium_mg: n['sodium_100g'] ? (n['sodium_100g'] as number) * 1000 : undefined,
            },
            source: 'open_food_facts' as const,
          }
          const { data: inserted } = await supabase
            .from('food_items')
            .insert(item)
            .select()
            .single()
          if (inserted) foods.push(inserted as FoodItem)
        }
      }
    } catch (err) {
      console.error('Open Food Facts error:', err)
    }
  }

  return NextResponse.json({ foods: foods.slice(0, 20) })
}
