import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a professional nutritionist and food scientist with deep knowledge of the USDA nutritional database. A user will describe a meal or food item in plain language. Your job is to estimate the nutritional content as accurately as possible.

Rules:
- Use common serving sizes and standard USDA values as your reference
- If a quantity is vague (e.g. "a bowl"), use a reasonable median portion
- Account for cooking methods (e.g., fried adds fat, boiling reduces water-soluble vitamins)
- Return ONLY valid JSON — no markdown, no explanation text
- Include a confidence field: "high" (specific food, clear quantity), "medium" (reasonable guess), or "low" (very vague or unusual)
- Include a notes field explaining your key assumptions (2–3 sentences max)
- Include an ingredients array listing what you identified

Return this exact JSON structure:
{
  "meal_name": "string",
  "total_servings": 1,
  "confidence": "high|medium|low",
  "notes": "string",
  "ingredients": ["string"],
  "nutrients": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number,
    "fiber_g": number,
    "sugar_g": number,
    "saturated_fat_g": number,
    "sodium_mg": number,
    "potassium_mg": number,
    "vitamin_a_mcg": number,
    "vitamin_c_mg": number,
    "vitamin_d_mcg": number,
    "calcium_mg": number,
    "iron_mg": number,
    "cholesterol_mg": number
  }
}`

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const result = JSON.parse(content.text)
    return NextResponse.json(result)
  } catch (err: unknown) {
    console.error('AI estimate error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Estimation failed' },
      { status: 500 }
    )
  }
}
