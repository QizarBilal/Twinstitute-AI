/**
 * Text-to-Speech utility for mentor responses
 * Uses Web Speech API or Groq TTS
 */

interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

/**
 * Generate speech from text using Web Speech API
 * Works in browser, no API key needed
 * Handles interruptions gracefully
 */
export function speakText(text: string, options: TTSOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech Synthesis not supported in this browser'))
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1
    utterance.lang = options.lang || 'en-US'

    utterance.onend = () => resolve()
    utterance.onerror = (event) => {
      // Gracefully handle "interrupted" errors (user stopped playback)
      if (event.error === 'interrupted') {
        resolve() // Treat interruption as normal completion
      } else {
        console.error('Speech synthesis error:', event.error)
        resolve() // Don't reject, just resolve silently
      }
    }

    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Stop current speech
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Format mentor response into readable text
 */
export function formatMentorResponseAsText(response: {
  analysis: string
  insights: string[]
  nextSteps: string[]
  risks: string[]
}): string {
  let text = ''

  if (response.analysis) {
    text += `Analysis: ${response.analysis}\n\n`
  }

  if (response.insights.length > 0) {
    text += `Insights:\n`
    response.insights.forEach((insight) => {
      text += `- ${insight}\n`
    })
    text += '\n'
  }

  if (response.nextSteps.length > 0) {
    text += `Next Steps:\n`
    response.nextSteps.forEach((step) => {
      text += `- ${step}\n`
    })
    text += '\n'
  }

  if (response.risks.length > 0) {
    text += `Risks to be aware of:\n`
    response.risks.forEach((risk) => {
      text += `- ${risk}\n`
    })
  }

  return text.trim()
}

/**
 * Check if Web Speech API is available
 */
export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}
