import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Zap, X, CheckCircle } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

const DAILY_XP = 75
const TIME_LIMIT = 60 // seconds

// Pick 5 questions from all quiz games
function getDailyQuestions(games) {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const allQuestions = games
    .filter((g) => g.gameType === 'quiz')
    .flatMap((g) => g.content.questions.filter((q) => !q.openEnded && q.options))
  if (allQuestions.length === 0) return []
  // Deterministic shuffle based on today's date seed
  const shuffled = [...allQuestions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(5, shuffled.length))
}

export default function DailyChallenge() {
  const games = useGameStore((s) => s.games)
  const completeDailyChallenge = useGameStore((s) => s.completeDailyChallenge)
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)

  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)

  const today = new Date().toDateString()
  const alreadyDone = student?.lastDailyDate === today
  const questions = getDailyQuestions(games)
  const hasQuestions = questions.length > 0

  const scoreRef = useRef(0)
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const endGame = useCallback((finalScore) => {
    setFinished(true)
    const xp = Math.round((finalScore / questions.length) * DAILY_XP)
    if (currentStudentId) {
      completeDailyChallenge(currentStudentId)
      submitGameResult(currentStudentId, 'daily', Math.round((finalScore / questions.length) * 100), xp)
    }
  }, [currentStudentId, questions.length, completeDailyChallenge, submitGameResult])

  useEffect(() => {
    if (!playing || finished) return
    if (timeLeft <= 0) {
      endGame(scoreRef.current)
      return
    }
    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [playing, finished, timeLeft, endGame])

  const startGame = () => {
    setPlaying(true)
    setCurrentQ(0)
    setSelected(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
    setTimeLeft(TIME_LIMIT)
  }

  const handleAnswer = (index) => {
    if (showResult) return
    setSelected(index)
    setShowResult(true)
    const q = questions[currentQ]
    if (index === q.correctIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      endGame(score)
    }
  }

  const finalScore = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  const timerColor = timeLeft > 30 ? 'text-emerald-600 dark:text-emerald-400' : timeLeft > 10 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
          alreadyDone
            ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10'
            : 'border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 cursor-pointer'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${alreadyDone ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          {alreadyDone ? '✅' : '📅'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Défi Quotidien</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {alreadyDone ? 'Complété aujourd\'hui · Revenez demain !' : hasQuestions ? `5 questions · ${TIME_LIMIT}s · +${DAILY_XP} XP max` : 'Créez des jeux quiz pour activer ce défi'}
          </div>
        </div>
        {!alreadyDone && hasQuestions && (
          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold shrink-0 animate-pulse">Nouveau!</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => !playing && setOpen(false)}>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {!playing && !finished && (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">📅</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Défi Quotidien</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{questions.length} questions · {TIME_LIMIT} secondes</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-6">Jusqu'à +{DAILY_XP} XP · Revient chaque jour !</p>
                {!hasQuestions ? (
                  <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-4 py-3 mb-6">Aucun quiz disponible. Demandez à votre enseignant de créer des jeux !</p>
                ) : alreadyDone ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 justify-center">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">Déjà complété aujourd'hui ! Revenez demain.</span>
                  </div>
                ) : null}
                <div className="flex gap-3 justify-center">
                  {hasQuestions && !alreadyDone && (
                    <button onClick={startGame} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200">
                      <Zap size={16} /> Commencer !
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200">
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {playing && !finished && questions[currentQ] && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Q {currentQ + 1}/{questions.length}</span>
                  <div className={`flex items-center gap-1.5 font-bold text-sm ${timerColor}`}>
                    <Timer size={14} />
                    {timeLeft}s
                  </div>
                  <button onClick={() => { setOpen(false); setPlaying(false) }} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">{questions[currentQ].question}</h3>
                <div className="space-y-2">
                  {questions[currentQ].options.map((opt, i) => {
                    let cls = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    if (showResult && i === questions[currentQ].correctIndex) cls = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                    else if (showResult && i === selected) cls = 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600'
                    return (
                      <button key={i} onClick={() => handleAnswer(i)} disabled={showResult}
                        className={`w-full p-3 rounded-xl border text-left text-sm transition-all duration-200 ${cls}`}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {showResult && (
                  <button onClick={next} className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all duration-200">
                    {currentQ < questions.length - 1 ? 'Suivant →' : 'Voir résultat'}
                  </button>
                )}
              </div>
            )}

            {finished && (
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">{finalScore >= 70 ? '🎉' : '💪'}</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Défi terminé !</h2>
                <p className="text-2xl font-bold text-amber-500 mb-1">{score}/{questions.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{finalScore}%</p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3 flex items-center gap-2 justify-center mb-6">
                  <Zap size={16} className="text-indigo-500" />
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">+{Math.round((score / questions.length) * DAILY_XP)} XP gagnés !</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Revenez demain pour un nouveau défi !</p>
                <button onClick={() => { setOpen(false); setPlaying(false); setFinished(false) }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
