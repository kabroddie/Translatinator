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

sendBar.addEventListener('input', () => {
  autoResizeTextarea()
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
  autoResizeTextarea()
}

const autoResizeTextarea = () => {
  sendBar.style.height = 'auto';
  sendBar.style.height = Math.min(sendBar.scrollHeight, 160) + 'px';
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

const generateAIResponse = async (message, language) => {
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
}

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}
