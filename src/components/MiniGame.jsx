import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, X, Timer } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'

const MINI_TIME = 30
const MINI_XP = 20

function pickRandomQuestions(games, count) {
  const allQ = games
    .filter((g) => g.gameType === 'quiz' && g.content?.questions)
    .flatMap((g) => g.content.questions.filter((q) => !q.openEnded && q.options))
  if (allQ.length === 0) return []
  const shuffled = [...allQ].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export default function MiniGame({ onClose }) {
  const games = useGameStore((s) => s.games)
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)

  const [mode, setMode] = useState(null) // 'quiz' | 'pairs'
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(MINI_TIME)

  const scoreRef = useRef(0)
  useEffect(() => { scoreRef.current = score }, [score])

  const endGame = useCallback((finalScore) => {
    setFinished(true)
    const xp = Math.round((finalScore / Math.max(questions.length, 1)) * MINI_XP)
    if (currentStudentId && questions.length > 0) {
      submitGameResult(currentStudentId, 'mini-' + Date.now(), finalScore, xp)
    }
  }, [currentStudentId, questions.length, submitGameResult])

  useEffect(() => {
    if (!mode || finished) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame(scoreRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [mode, finished, endGame])

  const startQuiz = () => {
    const qs = pickRandomQuestions(games, 5)
    if (qs.length === 0) return
    setQuestions(qs)
    setMode('quiz')
    setCurrentQ(0)
    setScore(0)
    setFinished(false)
    setTimeLeft(MINI_TIME)
    setSelected(null)
    setShowResult(false)
    playSound.click()
  }

  const startPairs = () => {
    const allPairs = games
      .filter((g) => g.gameType === 'puzzle' && g.content?.pairs)
      .flatMap((g) => g.content.pairs)
    if (allPairs.length < 3) return
    const shuffled = [...allPairs].sort(() => Math.random() - 0.5).slice(0, 4)
    setQuestions(shuffled)
    setMode('pairs')
    setScore(0)
    setFinished(false)
    setTimeLeft(MINI_TIME)
    playSound.click()
  }

  const handleQuizAnswer = (qIdx) => {
    if (showResult || finished) return
    setSelected(qIdx)
    setShowResult(true)
    const isCorrect = qIdx === questions[currentQ].correctIndex
    if (isCorrect) {
      playSound.correct()
      setScore((s) => s + 1)
    } else {
      playSound.incorrect()
    }
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) {
        endGame(isCorrect ? score + 1 : score)
      } else {
        setCurrentQ((q) => q + 1)
        setSelected(null)
        setShowResult(false)
      }
    }, 800)
  }

  const xpGained = Math.round((score / Math.max(questions.length, 1)) * MINI_XP)

  if (mode && finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm mx-4 shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="text-4xl mb-3">{score === questions.length ? '⚡' : score >= questions.length / 2 ? '👍' : '💪'}</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Mini-jeu terminé !</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{score} / {questions.length} correct</p>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-950/40 rounded-xl p-3 flex items-center justify-center gap-2 mt-4">
            <Zap size={16} className="text-indigo-500 fill-indigo-500" />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">+{xpGained} XP</span>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => { setMode(null); setFinished(false); setQuestions([]); setScore(0) }}
              className="flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 py-2.5 rounded-xl text-xs font-bold transition-colors">
              Rejouer
            </button>
            <button onClick={onClose}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
        {!mode ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Mini-jeu Flash</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">30 secondes pour briller ! Choisissez votre mode.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={startQuiz}
                className="flex flex-col items-center gap-2 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200">
                <span className="text-3xl">⚡</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Quiz Flash</span>
                <span className="text-[10px] text-slate-400">5 questions rapides</span>
              </button>
              <button onClick={startPairs}
                className="flex flex-col items-center gap-2 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200">
                <span className="text-3xl">🧩</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Puzzle Rapide</span>
                <span className="text-[10px] text-slate-400">Associez 4 paires</span>
              </button>
            </div>
          </div>
        ) : mode === 'quiz' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer size={16} className={timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-indigo-500'} />
                <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>{timeLeft}s</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{currentQ + 1} / {questions.length}</span>
            </div>
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">{questions[currentQ]?.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {questions[currentQ]?.options.map((opt, i) => {
                let cls = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                if (showResult) {
                  if (i === questions[currentQ].correctIndex) cls = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                  else if (i === selected) cls = 'bg-red-50 dark:bg-red-900/30 border-red-400 text-red-600 dark:text-red-400'
                }
                return (
                  <button key={i} onClick={() => handleQuizAnswer(i)} disabled={showResult}
                    className={`p-3 rounded-lg border text-xs font-medium text-left transition-all duration-150 ${cls}`}>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer size={16} className={timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-indigo-500'} />
                <span className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-900 dark:text-slate-100'}`}>{timeLeft}s</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Score: {score}</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 text-center">Appariez chaque concept à sa définition</p>
            <MiniPairGame pairs={questions} onScore={() => setScore((s) => s + 1)} onFinished={() => endGame(score)} />
          </div>
        )}
      </div>
    </div>
  )
}

function MiniPairGame({ pairs, onScore, onFinished }) {
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [matched, setMatched] = useState([])
  const [flashWrong, setFlashWrong] = useState(null)

  const leftItems = useState(() => [...pairs].sort(() => Math.random() - 0.5))[0]
  const rightItems = useState(() => [...pairs].sort(() => Math.random() - 0.5))[0]

  const handleRightClick = (rightId) => {
    if (matched.includes(rightId) || !selectedLeft) return
    const right = rightItems.find((r) => r.id === rightId)
    if (selectedLeft === right.id) {
      playSound.correct()
      const newMatched = [...matched, rightId]
      setMatched(newMatched)
      setSelectedLeft(null)
      onScore()
      if (newMatched.length === pairs.length) {
        setTimeout(onFinished, 500)
      }
    } else {
      playSound.incorrect()
      setFlashWrong(rightId)
      setSelectedLeft(null)
      setTimeout(() => setFlashWrong(null), 400)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {leftItems.map((p) => (
          <button key={p.id} onClick={() => setSelectedLeft(p.id)}
            className={`w-full p-2.5 rounded-lg border text-[11px] text-left transition-all duration-150 ${
              matched.includes(p.id) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-300'
              : selectedLeft === p.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-300'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-300'
            }`}>
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {rightItems.map((p) => (
          <button key={p.id} onClick={() => handleRightClick(p.id)}
            className={`w-full p-2.5 rounded-lg border text-[11px] text-left transition-all duration-150 ${
              matched.includes(p.id) ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-700 dark:text-emerald-300'
              : flashWrong === p.id ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-300'
            }`}>
            {p.right}
          </button>
        ))}
      </div>
    </div>
  )
}
