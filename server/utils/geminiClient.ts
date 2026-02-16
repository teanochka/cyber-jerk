import { GoogleGenerativeAI } from '@google/generative-ai'

let _client: GoogleGenerativeAI | null = null

function getGeminiClient(): GoogleGenerativeAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.')
    }
    
    _client = new GoogleGenerativeAI(apiKey)
  }
  return _client
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system'
  parts: string | Array<{ text: string }>
}

export interface GeminiResponse {
  text: string
  metadata?: {
    model?: string
    finishReason?: string
    usage?: {
      promptTokens?: number
      candidatesTokens?: number
      totalTokens?: number
    }
  }
}

/**
 * Send a chat message to Gemini and get a response
 */
export async function sendToGemini(
  messages: ChatMessage[],
  systemInstruction?: string,
  modelName?: string
): Promise<GeminiResponse> {
  const model = modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  
  const client = getGeminiClient()
  const genModel = client.getGenerativeModel({ 
    model,
    systemInstruction: systemInstruction || undefined,
  })

  // Convert messages to Gemini format
  const chatHistory = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => {
      const text = typeof msg.parts === 'string' 
        ? msg.parts 
        : Array.isArray(msg.parts) 
          ? msg.parts.map(p => typeof p === 'string' ? p : p.text).join('\n')
          : ''
      
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text }]
      }
    })

  const maxRetries = 3
  const retryDelays = [2000, 5000, 10000] // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use startChat for multi-turn conversations, or generateContent for single turn
      let result

      if (chatHistory.length > 1) {
        const chat = genModel.startChat({
          history: chatHistory.slice(0, -1),
        })
        result = await chat.sendMessage(chatHistory[chatHistory.length - 1].parts[0].text)
      } else {
        result = await genModel.generateContent(chatHistory[0].parts[0].text)
      }

      const response = result.response
      const text = response.text()

      return {
        text,
        metadata: {
          model,
          finishReason: response.candidates?.[0]?.finishReason,
          usage: response.usageMetadata ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            candidatesTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          } : undefined,
        }
      }
    } catch (error: any) {
      const isRateLimit = /429|Too Many Requests|quota/i.test(error?.message || '')
      if (isRateLimit && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, retryDelays[attempt]))
        continue
      }
      if (isRateLimit) {
        throw new Error(
          'Превышен лимит запросов к Gemini API. Подождите несколько минут или проверьте квоту и тариф: https://ai.google.dev/gemini-api/docs/rate-limits'
        )
      }
      throw new Error(`Gemini API error: ${error.message}`)
    }
  }

  throw new Error('Gemini API error: request failed after retries')
}
