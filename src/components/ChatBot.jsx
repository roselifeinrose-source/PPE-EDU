import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap, Mic, MicOff, Volume2 } from 'lucide-react'
import { playSound } from '../utils/soundService'
import { chatWithAI } from '../utils/aiService'

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Posez-moi une question sur l\'informatique.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const endRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.lang = 'fr-FR'
      rec.interimResults = true

      rec.onstart = () => setIsListening(true)

      rec.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (event.results[event.results.length - 1].isFinal) {
          setInput((prev) => (prev ? prev + ' ' + transcript : transcript))
        }
      }

      rec.onerror = () => setIsListening(false)
      rec.onend = () => setIsListening(false)

      recognitionRef.current = rec
    }
  }, [])

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.")
      return
    }
    playSound.click()
    if (isListening) recognitionRef.current.stop()
    else recognitionRef.current.start()
  }

  const speakText = (text) => {
    playSound.click()
    if (!window.speechSynthesis) {
      alert("La synthèse vocale n'est pas supportée par votre navigateur.")
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fr-FR'
    window.speechSynthesis.speak(utterance)
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    const sysPrompt = 'Tu es un assistant pédagogique en informatique pour collégiens marocains. Réponds en français de façon claire et concise.'
    const { text } = await chatWithAI(userMsg, sysPrompt)
    setMessages((prev) => [...prev, { role: 'assistant', text }])
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
          <Bot size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Assistant IA Vocal</span>
          {!import.meta.env.VITE_GEMINI_API_KEY && <span className="text-[10px] text-amber-600 dark:text-amber-400 ml-auto">Aucune clé API</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm relative group ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="flex items-center gap-1.5">
                    {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                    <span className="text-[10px] opacity-70">{msg.role === 'user' ? 'Vous' : 'Assistant'}</span>
                  </div>
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      title="Lire à voix haute"
                      className="text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Volume2 size={13} />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Zap size={14} className="animate-pulse" /> Réflexion...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
          <button
            type="button"
            onClick={toggleListen}
            title={isListening ? "Arrêter l'écoute" : "Poser votre question à l'oral"}
            className={`p-2.5 rounded-lg border transition-all duration-200 shrink-0 ${isListening ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-350'}`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={isListening ? "Écoute en cours..." : "Posez une question..."}
            maxLength={500}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-all duration-200"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
