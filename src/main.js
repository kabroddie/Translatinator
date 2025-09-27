// import { GoogleGenAI } from '@google/genai'

const chatMessages = document.querySelector('.chat-messages')

const sendBar = document.getElementById('send-bar')
const sendBtn = document.getElementById('send-btn')
const languageSelector = document.getElementById('language-selector')


sendBar.addEventListener('keypress', async e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handlePrompt()
  }
})

sendBtn.addEventListener('submit', async e => {
  e.preventDefault()
  handlePrompt()
})

sendBtn.addEventListener('click', async e => {
  e.preventDefault()
  handlePrompt()
  
})

const handlePrompt = async () => {
  const prompt = sendBar.value
  const language = languageSelector.value

  if (!prompt.trim()) return // Must have a non-empty message

  // console.log(prompt, language)
  renderMessage(prompt, "user")

  showTypingIndicator()

  try {
    const translationText = await generateAIResponse(prompt, language)
    hideTypingIndicator()
    renderMessage(translationText, "ai")
  } catch (error) {
    hideTypingIndicator()
    renderMessage("Sorry, translation failed. Please try again.", "ai")
    console.error('Translation error:', error)
  }

  scrollToBottom()
}

const renderMessage = (text, person) => {
  const newChat = document.createElement('div')
  newChat.className = `chat-bubble ${person}`
  newChat.innerHTML = `<p>${text}</p>`

  chatMessages.appendChild(newChat)

  sendBar.value = ''
}

const showTypingIndicator = () => {
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble ai typing-indicator';
  typingBubble.id = 'typingIndicator';
  typingBubble.innerHTML = '<p>Translating...</p>';
  
  chatMessages.appendChild(typingBubble);
  scrollToBottom();
  sendBtn.disabled = true;
}

const hideTypingIndicator = () => {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
  sendBtn.disabled = false;
}

async function generateAIResponse(message, language) {
  try {
    const response = await fetch('/api/translate', { 
      method: "POST",
      body: JSON.stringify({
        message: message,
        language: language
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP Error! Error status: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return data.translation
  }
  catch (error) {
    console.error(`API call failed: ${error}`)
    throw error
  }

  
  // const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

  // const config = {
  //   thinkingConfig: {
  //     thinkingBudget: 0,
  //   },
  //   systemInstruction: [
  //     {
  //       text: `You are a translator to English, Filipino, Conyo dialect, and Bisaya.
  //             Translate only to the selected language: ${language}.
  //             Keep your answers directly to the translation only.
  //             Format your answers in this way: /<Language>/: <Translation>.
  //             If Japanese, add the romaji translation on top of the japanese characters`,
  //     }
  //   ]
  // }

  // const model = 'gemini-2.5-flash'

  // const contents = [
  //   {
  //     role: 'user',
  //     parts: [
  //       {
  //         text: `Translate ${message} to ${language}`,
  //       },
  //     ],
  //   },
  // ]

  // const response = await ai.models.generateContent({
  //   model,
  //   config,
  //   contents,
  // });

  // return response.text
}

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}
