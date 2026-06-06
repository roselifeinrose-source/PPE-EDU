import { useState, useMemo } from 'react'
import { ArrowLeft, Zap, HelpCircle, GripVertical } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'
import avatarEvents from '../utils/avatarEvents'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PuzzleGame({ game, onBack }) {
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)

  const pairs = game.content.pairs
  const leftItems = useMemo(() => shuffle(pairs).map((p) => ({ id: p.id, text: p.left })), [pairs])
  const rightItems = useMemo(() => shuffle(pairs).map((p) => ({ id: p.id, text: p.right, matchesWith: p.id })), [pairs])
  
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [matched, setMatched] = useState([])
  const [finished, setFinished] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [dragOverRight, setDragOverRight] = useState(null)

  const checkMatch = (leftId, rightId) => {
    const rightItem = rightItems.find((r) => r.id === rightId)
    if (leftId === rightItem.matchesWith) {
      playSound.correct()
      avatarEvents.emit('correct')
      const newMatched = [...matched, rightId]
      setMatched(newMatched)
      setSelectedLeft(null)
      if (newMatched.length === pairs.length) {
        const finalScore = 100
        const xp = 50
        setFinished(true)
        playSound.levelUp()
        if (currentStudentId) submitGameResult(currentStudentId, game.id, finalScore, xp)
      }
      return true
    } else {
      playSound.incorrect()
      avatarEvents.emit('wrong')
      setSelectedLeft(null)
      return false
    }
  }

  const handleLeftClick = (id) => {
    playSound.click()
    setSelectedLeft(id)
  }

  const handleRightClick = (id) => {
    if (!selectedLeft || matched.includes(id)) return
    checkMatch(selectedLeft, id)
  }

  const handleDragStart = (e, leftId) => {
    if (matched.includes(leftId)) return
    e.dataTransfer.setData('text/plain', leftId)
    e.dataTransfer.effectAllowed = 'move'
    setSelectedLeft(leftId)
  }

  const handleDragOver = (e, rightId) => {
    if (matched.includes(rightId)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverRight(rightId)
  }

  const handleDragLeave = () => {
    setDragOverRight(null)
  }

  const handleDrop = (e, rightId) => {
    e.preventDefault()
    setDragOverRight(null)
    if (matched.includes(rightId)) return
    const leftId = e.dataTransfer.getData('text/plain')
    if (leftId) {
      checkMatch(leftId, rightId)
    }
  }

  const useHint = () => {
    if (hintsUsed >= 3 || matched.length === pairs.length) return
    playSound.click()

    const unmatchedPair = pairs.find(p => !matched.includes(p.id))
    if (unmatchedPair) {
      const newMatched = [...matched, unmatchedPair.id]
      setMatched(newMatched)
      setHintsUsed(h => h + 1)
      setSelectedLeft(null)

      if (newMatched.length === pairs.length) {
        const finalScore = 100
        const xp = 50
        setFinished(true)
        playSound.levelUp()
        if (currentStudentId) submitGameResult(currentStudentId, game.id, finalScore, xp)
      }
    }
  }

  if (finished) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Puzzle Complété!</h2>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1 mb-4"><Zap size={18} /> +50 XP</p>
        {hintsUsed > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Indices utilisés : {hintsUsed}/3</p>
        )}
        <button onClick={onBack} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">Retour</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-all duration-200">
          <ArrowLeft size={16} /> Retour
        </button>
        {hintsUsed < 3 && matched.length < pairs.length && (
          <button
            onClick={useHint}
            className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
          >
            <HelpCircle size={14} /> Obtenir un indice ({3 - hintsUsed} restants)
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{game.title}</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Glissez les concepts sur les définitions, ou cliquez pour associer</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Concepts</p>
            {leftItems.map((item) => (
              <button
                key={item.id}
                draggable={!matched.includes(item.id)}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => handleLeftClick(item.id)}
                className={`w-full p-3 rounded-lg border text-sm text-left transition-all duration-200 ${
                  selectedLeft === item.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-800'
                    : matched.includes(item.id)
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-350'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300 cursor-grab active:cursor-grabbing'
                }`}
              >
                <span className="flex items-center gap-2">
                  {!matched.includes(item.id) && <GripVertical size={12} className="text-slate-400 shrink-0" />}
                  {item.text}
                </span>
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Définitions</p>
            {rightItems.map((item) => (
              <button
                key={item.id}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.id)}
                onClick={() => handleRightClick(item.id)}
                disabled={matched.includes(item.id)}
                className={`w-full p-3 rounded-lg border text-sm text-left transition-all duration-200 ${
                  matched.includes(item.id)
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-350'
                    : dragOverRight === item.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-600 text-slate-700 dark:text-slate-300 ring-2 ring-indigo-300 dark:ring-indigo-700 scale-[1.02]'
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

