import { useState } from 'react'
import { ArrowLeft, ArrowUp, ArrowDown, Check, Zap } from 'lucide-react'
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

export default function SequencingGame({ game, onBack }) {
  const { submitGameResult } = useGameStore()
  const { currentStudentId } = useAuthStore()

  const [steps, setSteps] = useState(() => shuffle(game.content.steps))
  const [finished, setFinished] = useState(false)

  const moveUp = (i) => {
    if (i === 0) return
    const arr = [...steps]
    ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
    setSteps(arr)
  }

  const moveDown = (i) => {
    if (i === steps.length - 1) return
    const arr = [...steps]
    ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
    setSteps(arr)
  }

  const checkOrder = () => {
    const correct = steps.every((s, i) => s.order === i + 1)
    const finalScore = correct ? 100 : Math.round((steps.filter((s, i) => s.order === i + 1).length / steps.length) * 100)
    const xp = Math.round((finalScore / 100) * 50)
    setFinished(true)
    if (currentStudentId) submitGameResult(currentStudentId, game.id, finalScore, xp)
  }

  if (finished) {
    const correct = steps.every((s, i) => s.order === i + 1)
    const finalScore = correct ? 100 : Math.round((steps.filter((s, i) => s.order === i + 1).length / steps.length) * 100)
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">{correct ? '🎉' : '💪'}</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{correct ? 'Ordre Correct!' : 'Presque!'}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">Score: {finalScore}%</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1"><Zap size={18} /> +{Math.round((finalScore / 100) * 50)} XP</p>
        <button onClick={onBack} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">Retour</button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm mb-4 transition-all duration-200">
        <ArrowLeft size={16} /> Retour
      </button>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{game.title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Remettez les étapes dans le bon ordre</p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{step.text}</span>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(i)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"><ArrowUp size={14} /></button>
                <button onClick={() => moveDown(i)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"><ArrowDown size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={checkOrder} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2">
          <Check size={18} /> Vérifier l'ordre
        </button>
      </div>
    </div>
  )
}
