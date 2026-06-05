import { useState, useRef, useEffect } from 'react'
import { GoogleGenAI } from '@google/genai'
import { Send, Bot, User, Zap } from 'lucide-react'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour ! Posez-moi une question sur l\'informatique.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Clé API manquante. Ajoutez VITE_GEMINI_API_KEY dans le fichier .env' },
      ])
      setLoading(false)
      return
    }

    try {
      const ai = new GoogleGenAI({ apiKey })
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Tu es un assistant pédagogique en informatique pour collégiens marocains. Réponds en français de façon claire et concise.\n\nQuestion: ${userMsg}`,
      })
      setMessages((prev) => [...prev, { role: 'assistant', text: response.text || 'Pas de réponse.' }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Erreur de connexion à l\'API. Vérifiez votre clé et votre quota.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
          <Bot size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Assistant IA</span>
          {!apiKey && <span className="text-[10px] text-amber-600 dark:text-amber-400 ml-auto">Aucune clé API</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  <span className="text-[10px] opacity-70">{msg.role === 'user' ? 'Vous' : 'Assistant'}</span>
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Posez une question..."
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
