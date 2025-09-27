// api/translate.js
import { GoogleGenAI } from '@google/genai'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, language } = req.body

    // Validate input
    if (!message || !language) {
      return res.status(400).json({ error: 'Message and language are required' })
    }

    // Initialize Gemini AI with server-side API key
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      systemInstruction: [
        {
          text: `You are a translator to English, Filipino, Conyo dialect, and Bisaya.
                Translate only to the selected language: ${language}.
                Keep your answers directly to the translation only.
                Format your answers in this way: /${language}/: <Translation>.
                If Japanese, add the romaji translation on top of the japanese characters`,
        }
      ]
    }

    const model = 'gemini-2.5-flash'

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Translate ${message} to ${language}`,
          },
        ],
      },
    ]

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    })

    // Return the translation
    res.status(200).json({ translation: response.text })

  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({ error: 'Translation failed' })
  }
}