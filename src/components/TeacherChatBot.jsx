import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Mic, MicOff, Zap, Plus, Loader2, Sparkles } from 'lucide-react'
import { generateGameFromText, chatWithAI } from '../utils/aiService'
import useGameStore from '../store/useGameStore'
import { playSound } from '../utils/soundService'

const QUICK_ACTIONS = [
  { label: 'Créer un cours', prompt: 'Génère un cours d\'informatique niveau collège sur' },
  { label: 'Définir un concept', prompt: 'Explique simplement le concept suivant en informatique:' },
  { label: 'Plan de leçon', prompt: 'Propose un plan de leçon structuré pour enseigner' },
]

const GAME_TYPES = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'sequencing', label: 'Séquencement' },
  { value: 'memory', label: 'Memory' },
  { value: 'cloze', label: 'Texte à trous' },
  { value: 'dropping', label: 'Tri par chute' },
]

export default function TeacherChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Bonjour enseignant ! Je peux vous aider à créer du contenu de cours et des jeux pédagogiques. Que souhaitez-vous préparer ?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [generatingGame, setGeneratingGame] = useState(null)
  const [showActions, setShowActions] = useState(true)
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const addGame = useGameStore((s) => s.addGame)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

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

  const send = useCallback(async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setShowActions(false)
    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setLoading(true)

    const sysPrompt = `Tu es un assistant pédagogique spécialisé en informatique pour collégiens marocains (niveau collège). Tu aides les enseignants à préparer leurs cours et à créer du contenu éducatif.

Directives :
- Réponds toujours en français
- Structure tes réponses avec des titres et des listes claires
- Propose à la fin si l'enseignant veut "Générer un jeu" à partir de ce contenu
- Sois précis et adapté au programme marocain du collège`

    const { text: reply } = await chatWithAI(msg, sysPrompt)
    setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    setLoading(false)
  }, [input, loading])

  const generateGame = async (gameType) => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
    const contentText = lastAssistant?.text || messages.find((m) => m.role === 'assistant')?.text || input
    if (!contentText) return

    setGeneratingGame(gameType)
    try {
      const result = await generateGameFromText(contentText, gameType, () => {})
      addGame(result.game)
      const label = GAME_TYPES.find((g) => g.value === gameType)?.label || gameType
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: `✅ Jeu "${result.game.title}" (${label}) généré avec succès ! Vous le trouverez dans "Mes Jeux".`,
      }])
    } catch (err) {
      console.error('TeacherChatBot generateGame error:', err)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: '❌ Erreur lors de la génération du jeu. Veuillez réessayer.',
      }])
    } finally {
      setGeneratingGame(null)
    }
  }

  const quickAction = (prompt) => {
    setInput(prompt + ' ')
    setShowActions(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => { setOpen(!open); playSound.click() }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Assistant IA"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-12rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-slide-up">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Assistant IA</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Enseignant · Informatique</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm relative ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-800 dark:text-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {msg.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                    <span className="text-[10px] opacity-70">{msg.role === 'user' ? 'Vous' : 'Assistant'}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Zap size={14} className="animate-pulse" /> Réflexion...
                </div>
              </div>
            )}

            {/* Game generation actions on last assistant message */}
            {!loading && messages.length > 1 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.text.startsWith('✅') && (
              <div className="pt-1">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 font-medium flex items-center gap-1">
                  <Sparkles size={10} /> Générer un jeu depuis ce contenu :
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {GAME_TYPES.map((gt) => (
                    <button
                      key={gt.value}
                      onClick={() => generateGame(gt.value)}
                      disabled={generatingGame !== null}
                      className="text-[10px] px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingGame === gt.value ? (
                        <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Génération...</span>
                      ) : (
                        gt.label
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions shown at start */}
            {showActions && messages.length <= 1 && !loading && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Suggestions :</div>
                {QUICK_ACTIONS.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => quickAction(qa.prompt)}
                    className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus size={12} /> {qa.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2 shrink-0">
            <button
              onClick={toggleListen}
              className={`p-2.5 rounded-lg border shrink-0 transition-all ${
                isListening
                  ? 'bg-red-500 border-red-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
              title={isListening ? "Arrêter l'écoute" : 'Dicter votre message'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Écoute en cours...' : 'Posez votre question...'}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-all shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Quick CSS animation */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-slide-up { animation: fadeSlideUp 0.2s ease-out; }
      `}</style>
    </>
  )
}
