import { useState } from 'react'
import { ArrowLeft, Check, X, Zap, PenLine, Send, Target, RotateCcw } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'
import avatarEvents from '../utils/avatarEvents'

export default function QuizGame({ game, onBack }) {
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const submitOpenAnswer = useGameStore((s) => s.submitOpenAnswer)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [openText, setOpenText] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [failedConcepts, setFailedConcepts] = useState([])
  const [finished, setFinished] = useState(false)
  const [openSubmitted, setOpenSubmitted] = useState(false)

  // Targeted Revision Mode states
  const [missedQuestions, setMissedQuestions] = useState([]) // Array of question objects
  const [isRevision, setIsRevision] = useState(false)

  const questions = isRevision ? missedQuestions : game.content.questions
  const q = questions[currentQ]
  const isOpen = q ? !!q.openEnded : false

  const handleAnswer = (index) => {
    if (showResult) return
    setSelected(index)
    setShowResult(true)
    if (index === q.correctIndex) {
      playSound.correct()
      avatarEvents.emit('correct')
      setScore((s) => s + 1)
    } else {
      playSound.incorrect()
      avatarEvents.emit('wrong')
      if (!isRevision) {
        setMissedQuestions((prev) => [...prev, q])
        if (q.concept) {
          setFailedConcepts((prev) => [...new Set([...prev, q.concept])])
        }
      }
    }
  }

  const handleOpenSubmit = () => {
    if (!openText.trim()) return
    if (currentStudentId) {
      submitOpenAnswer(currentStudentId, game.id, q.id, q.question, openText.trim(), q.hint || '')
    }
    playSound.click()
    setOpenSubmitted(true)
    setShowResult(true)
  }

  const startRevision = () => {
    playSound.click()
    setIsRevision(true)
    setCurrentQ(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
  }

  const next = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1)
      setSelected(null)
      setShowResult(false)
      setOpenText('')
      setOpenSubmitted(false)
    } else {
      if (isRevision) {
        setFinished(true)
        playSound.levelUp()
        // Award a small revision bonus XP (e.g. 15 XP)
        if (currentStudentId) {
          submitGameResult(currentStudentId, game.id + '_revision', 100, 15)
        }
      } else {
        const totalMcq = questions.filter((qq) => !qq.openEnded).length
        const finalScore = totalMcq > 0 ? Math.round((score / totalMcq) * 100) : 100
        const xp = Math.round((finalScore / 100) * 50)
        setFinished(true)
        if (currentStudentId) {
          submitGameResult(currentStudentId, game.id, finalScore, xp, failedConcepts)
        }
        if (finalScore === 100) {
          playSound.levelUp()
        }
        avatarEvents.emit('gamecomplete', finalScore)
      }
    }
  }

  if (finished) {
    if (isRevision) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-lg mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Révision Terminée !</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Vous avez revu avec succès toutes vos erreurs sur ce jeu.
          </p>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 mb-6 text-sm text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <Zap size={18} className="text-emerald-500 fill-emerald-500" />
            <span>Bonus de révision : <strong>+15 XP</strong> obtenus !</span>
          </div>
          <button onClick={onBack} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-200">
            Retour aux défis
          </button>
        </div>
      )
    }

    const totalMcq = questions.filter((qq) => !qq.openEnded).length
    const openCount = questions.filter((qq) => qq.openEnded).length
    const finalScore = totalMcq > 0 ? Math.round((score / totalMcq) * 100) : 100
    
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-lg mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="text-5xl mb-4">{finalScore >= 70 ? '🎉' : '💪'}</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Mission Complétée!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">Score QCM: {finalScore}%</p>
        
        {openCount > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg mb-3">
            📝 {openCount} question{openCount > 1 ? 's ouvertes' : ' ouverte'} en attente de correction manuelle
          </p>
        )}
        
        <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1 mb-6">
          <Zap size={18} /> +{Math.round((finalScore / 100) * 50)} XP
        </p>

        {missedQuestions.length > 0 && (
          <div className="border border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 mb-6 text-left">
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
              <Target size={16} /> Mode Révision Ciblé
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Vous avez raté {missedQuestions.length} question{missedQuestions.length > 1 ? 's' : ''}. Rejouez-les maintenant pour consolider vos acquis et gagner des XP bonus.
            </p>
            <button
              onClick={startRevision}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-xs font-semibold transition-all duration-200"
            >
              <RotateCcw size={14} /> Lancer la révision (+15 XP)
            </button>
          </div>
        )}

        <button onClick={onBack} className="w-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">
          Retour aux défis
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm mb-4 transition-all duration-200">
        <ArrowLeft size={16} /> Retour
      </button>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isRevision ? 'Révision : ' : ''}Question {currentQ + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-2">
            {isOpen && (
              <span className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                <PenLine size={10} /> Question ouverte
              </span>
            )}
            {isRevision && (
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                <Target size={10} /> Révision
              </span>
            )}
            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">{game.title}</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">{q.question}</h3>

        {isOpen ? (
          <div className="space-y-3">
            {q.hint && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">💡 Indice : {q.hint}</p>
            )}
            {!openSubmitted ? (
              <>
                <textarea
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  rows={4}
                  placeholder="Écrivez votre réponse ici..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all duration-200 placeholder:text-slate-400"
                />
                <button
                  onClick={handleOpenSubmit}
                  disabled={!openText.trim()}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <Send size={14} /> Soumettre la réponse
                </button>
              </>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-4 text-sm text-amber-700 dark:text-amber-300">
                ✅ Votre réponse a été envoyée à l'enseignant pour correction.
              </div>
            )}
            {showResult && (
              <button onClick={next} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-200">
                {currentQ < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              if (showResult && i === q.correctIndex) cls = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
              else if (showResult && i === selected && i !== q.correctIndex) cls = 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300'
              else if (selected === i) cls = 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-600'
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border text-left text-sm transition-all duration-200 ${cls}`}
                >
                  <span>{opt}</span>
                  {showResult && i === q.correctIndex && <Check size={18} />}
                  {showResult && i === selected && i !== q.correctIndex && <X size={18} />}
                </button>
              )
            })}
            {showResult && (
              <button onClick={next} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-200">
                {currentQ < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

