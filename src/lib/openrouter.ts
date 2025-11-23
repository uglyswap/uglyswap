export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length: number
  pricing: {
    prompt: string
    completion: string
  }
}

export async function getOpenRouterModels(apiKey: string): Promise<OpenRouterModel[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data || []
}

export async function generateWithOpenRouter(
  apiKey: string,
  model: string,
  prompt: string,
  siteUrl?: string,
  siteName?: string
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': siteName || 'Prompt SaaS',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || `Generation failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

export async function testOpenRouterConnection(apiKey: string): Promise<boolean> {
  try {
    const models = await getOpenRouterModels(apiKey)
    return models.length > 0
  } catch {
    return false
  }
}
