import { useState, useMemo } from 'react'
import { ArrowLeft, RefreshCw, Zap, Check, AlertCircle } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'
import avatarEvents from '../utils/avatarEvents'

// Helper to shuffle array
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function ClozeGame({ game, onBack }) {
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)

  const [selections, setSelections] = useState({}) // blankId -> keyword
  const [selectedWord, setSelectedWord] = useState(null) // for tap-to-select fallback
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  const blanks = useMemo(() => game.content?.blanks || {}, [game.content?.blanks])
  const totalBlanks = Object.keys(blanks).length

  // Parse text into segment tokens
  const segments = useMemo(() => {
    const text = game.content?.text || ''
    return text.split(/(\[blank\d+\])/g)
  }, [game.content?.text])

  // Gather and shuffle keyword chips
  const initialChips = useMemo(() => {
    const chipsSet = new Set()
    Object.values(blanks).forEach((b) => {
      if (b.options) b.options.forEach((o) => chipsSet.add(o))
      if (b.correct) chipsSet.add(b.correct)
    })
    return shuffle(Array.from(chipsSet))
  }, [blanks])

  // Available chips (not placed yet)
  const availableChips = useMemo(() => {
    const placedWords = Object.values(selections)
    return initialChips.filter((word) => !placedWords.includes(word))
  }, [initialChips, selections])

  const initGame = () => {
    setSelections({})
    setSelectedWord(null)
    setSubmitted(false)
    setScore(0)
    setShowFeedback(false)
    playSound.click()
  }

  const handlePlaceWord = (blankId, word) => {
    if (submitted) return
    playSound.click()
    setSelections((prev) => ({
      ...prev,
      [blankId]: word,
    }))
    if (selectedWord === word) {
      setSelectedWord(null)
    }
  }

  const handleRemoveWord = (blankId) => {
    if (submitted) return
    playSound.click()
    setSelections((prev) => {
      const copy = { ...prev }
      delete copy[blankId]
      return copy
    })
  }

  const handleSelectWord = (word) => {
    if (submitted) return
    playSound.click()
    setSelectedWord((prev) => (prev === word ? null : word))
  }

  const handleSubmit = () => {
    if (submitted) return
    let correct = 0
    Object.entries(blanks).forEach(([blankId, data]) => {
      if (selections[blankId] === data.correct) {
        correct++
      }
    })

    const finalScore = Math.round((correct / totalBlanks) * 100)
    setScore(finalScore)
    setSubmitted(true)
    setShowFeedback(true)

    playSound.levelUp()
    avatarEvents.emit('gamecomplete', finalScore)
    const xp = Math.round((finalScore / 100) * 50)
    if (currentStudentId) {
      submitGameResult(currentStudentId, game.id, finalScore, xp)
    }
  }

  const allFilled = Object.keys(selections).length === totalBlanks
  const xpGained = Math.round((score / 100) * 50)

  // Drag and Drop Handlers
  const handleDragStart = (e, word) => {
    if (submitted) return
    e.dataTransfer.setData('text/plain', word)
    setSelectedWord(word)
  }

  const handleDrop = (e, blankId) => {
    e.preventDefault()
    if (submitted) return
    const word = e.dataTransfer.getData('text/plain') || selectedWord
    if (word) {
      handlePlaceWord(blankId, word)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <ArrowLeft size={16} /> Retour
        </button>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-none">{game.title}</h2>
        <button onClick={initGame} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all" title="Recommencer">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm space-y-6">
        {/* Helper Tip */}
        {!submitted && (
          <div className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg flex items-start gap-2 border border-slate-100 dark:border-slate-800">
            <AlertCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
            <p>Glissez les étiquettes de mots dans les zones vides ou tapez sur un mot puis sur la zone vide correspondante.</p>
          </div>
        )}

        {/* Paragraphe principal */}
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 p-5 sm:p-6 rounded-2xl">
          <p className="text-sm sm:text-base leading-loose sm:leading-loose text-slate-700 dark:text-slate-350 select-none">
            {segments.map((seg, index) => {
              const match = seg.match(/^\[(blank\d+)\]$/)
              if (match) {
                const blankId = match[1]
                const placedWord = selections[blankId]
                const isCorrect = submitted && placedWord === blanks[blankId]?.correct

                return (
                  <span
                    key={blankId}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, blankId)}
                    onClick={() => {
                      if (placedWord) {
                        handleRemoveWord(blankId)
                      } else if (selectedWord) {
                        handlePlaceWord(blankId, selectedWord)
                      }
                    }}
                    className={`inline-flex items-center justify-center min-w-[100px] px-3 py-0.5 mx-1.5 rounded-lg border-2 border-dashed select-none transition-all duration-200 cursor-pointer ${
                      submitted
                        ? isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600 dark:text-red-400 font-bold'
                        : placedWord
                          ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-400 text-indigo-700 dark:text-indigo-400 font-semibold'
                          : selectedWord
                            ? 'border-amber-400 bg-amber-50/20 animate-pulse'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900'
                    }`}
                  >
                    {placedWord || <span className="text-xs text-slate-400 dark:text-slate-500">Déposer ici</span>}
                  </span>
                )
              }
              return <span key={index}>{seg}</span>
            })}
          </p>
        </div>

        {/* Word Chips Panel */}
        {!submitted && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mots disponibles</h3>
            <div className="flex flex-wrap gap-2">
              {availableChips.map((word) => (
                <div
                  key={word}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, word)}
                  onClick={() => handleSelectWord(word)}
                  className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold select-none shadow-sm cursor-grab hover:scale-105 active:cursor-grabbing transition-all duration-150 ${
                    selectedWord === word
                      ? 'bg-amber-500 border-amber-600 text-white shadow-md ring-2 ring-amber-400/20 scale-105'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-800'
                  }`}
                >
                  {word}
                </div>
              ))}
              {availableChips.length === 0 && (
                <p className="text-xs text-slate-400 italic">Tous les mots ont été placés.</p>
              )}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {submitted && showFeedback && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="text-4xl">
              {score === 100 ? '🎉' : score >= 60 ? '👍' : '💪'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Score de complétion</h3>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{score}%</p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-950/40 rounded-xl py-3 px-4 flex items-center justify-center gap-2 max-w-xs mx-auto">
              <Zap size={16} className="text-indigo-500 fill-indigo-500" />
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">+{xpGained} XP gagnés !</span>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-750">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allFilled}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Check size={16} /> Valider mes réponses
            </button>
          ) : (
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={initGame} className="flex-1 sm:flex-initial border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors">
                Rejouer
              </button>
              <button onClick={onBack} className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors">
                Quitter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
