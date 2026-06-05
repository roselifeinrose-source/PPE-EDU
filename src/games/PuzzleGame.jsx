import { useState, useMemo } from 'react'
import { ArrowLeft, Zap } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PuzzleGame({ game, onBack }) {
  const { submitGameResult } = useGameStore()
  const { currentStudentId } = useAuthStore()

  const pairs = game.content.pairs
  const leftItems = useMemo(() => shuffle(pairs).map((p) => ({ id: p.id, text: p.left })), [pairs])
  const rightItems = useMemo(() => shuffle(pairs).map((p) => ({ id: p.id, text: p.right, matchesWith: p.id })), [pairs])
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [matched, setMatched] = useState([])
  const [finished, setFinished] = useState(false)

  const handleLeftClick = (id) => setSelectedLeft(id)

  const handleRightClick = (id) => {
    if (!selectedLeft || matched.includes(id)) return
    const rightItem = rightItems.find((r) => r.id === id)
    if (selectedLeft === rightItem.matchesWith) {
      const newMatched = [...matched, id]
      setMatched(newMatched)
      setSelectedLeft(null)
      if (newMatched.length === pairs.length) {
        const finalScore = 100
        const xp = 50
        setFinished(true)
        if (currentStudentId) submitGameResult(currentStudentId, game.id, finalScore, xp)
      }
    } else {
      setSelectedLeft(null)
    }
  }

  if (finished) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Puzzle Complété!</h2>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1"><Zap size={18} /> +50 XP</p>
        <button onClick={onBack} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">Retour</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm mb-4 transition-all duration-200">
        <ArrowLeft size={16} /> Retour
      </button>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{game.title}</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Associez chaque concept à sa définition</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Concepts</p>
            {leftItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLeftClick(item.id)}
                className={`w-full p-3 rounded-lg border text-sm text-left transition-all duration-200 ${
                  selectedLeft === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : matched.includes(item.id)
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.text}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Définitions</p>
            {rightItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleRightClick(item.id)}
                disabled={matched.includes(item.id)}
                className={`w-full p-3 rounded-lg border text-sm text-left transition-all duration-200 ${
                  matched.includes(item.id)
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                    : selectedLeft && !matched.includes(item.id)
                      ? 'bg-slate-50 dark:bg-slate-900 border-indigo-300 dark:border-indigo-600 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
