import { useState } from 'react'
import { ArrowLeft, Check, X, Zap } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

export default function QuizGame({ game, onBack }) {
  const { submitGameResult } = useGameStore()
  const { currentStudentId } = useAuthStore()
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [failedConcepts, setFailedConcepts] = useState([])
  const [finished, setFinished] = useState(false)

  const questions = game.content.questions
  const q = questions[currentQ]

  const handleAnswer = (index) => {
    if (showResult) return
    setSelected(index)
    setShowResult(true)
    if (index === q.correctIndex) {
      setScore((s) => s + 1)
    } else if (q.concept) {
      setFailedConcepts((prev) => [...new Set([...prev, q.concept])])
    }
  }

  const next = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      const finalScore = Math.round((score / questions.length) * 100)
      const xp = Math.round((finalScore / 100) * 50)
      setFinished(true)
      if (currentStudentId) submitGameResult(currentStudentId, game.id, finalScore, xp, failedConcepts)
    }
  }

  if (finished) {
    const finalScore = Math.round((score / questions.length) * 100)
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">{finalScore >= 70 ? '🎉' : '💪'}</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Mission Complétée!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">Score: {finalScore}%</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1"><Zap size={18} /> +{Math.round((finalScore / 100) * 50)} XP</p>
        <button onClick={onBack} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">Retour aux défis</button>
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
          <span className="text-xs text-slate-500 dark:text-slate-400">Question {currentQ + 1} / {questions.length}</span>
          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">{game.title}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">{q.question}</h3>
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
        </div>
        {showResult && (
          <button onClick={next} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-200">
            {currentQ < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
          </button>
        )}
      </div>
    </div>
  )
}
