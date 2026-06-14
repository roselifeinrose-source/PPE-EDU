import { useState } from 'react'
import { ArrowLeft, ArrowUp, ArrowDown, Check, Zap, HelpCircle } from 'lucide-react'
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

export default function SequencingGame({ game, onBack }) {
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)

  const [steps, setSteps] = useState(() => shuffle(game.content.steps))
  const [finished, setFinished] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)

  const moveUp = (i) => {
    if (i === 0) return
    playSound.click()
    const arr = [...steps]
    ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
    setSteps(arr)
  }

  const moveDown = (i) => {
    if (i === steps.length - 1) return
    playSound.click()
    const arr = [...steps]
    ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
    setSteps(arr)
  }

  const checkOrder = () => {
    const correct = steps.every((s, i) => s.order === i + 1)
    const finalScore = correct ? 100 : Math.round((steps.filter((s, i) => s.order === i + 1).length / steps.length) * 100)
    const xp = Math.round((finalScore / 100) * 50)
    setFinished(true)
    if (correct) {
      playSound.levelUp()
      avatarEvents.emit('correct')
    } else {
      playSound.incorrect()
      avatarEvents.emit('wrong')
    }
    if (currentStudentId) submitGameResult(currentStudentId, game.id, finalScore, xp)
  }

  const useHint = () => {
    if (hintsUsed >= 3) return
    playSound.click()

    // Find the first index that is out of order
    const wrongIdx = steps.findIndex((s, idx) => s.order !== idx + 1)
    if (wrongIdx !== -1) {
      // Find the step that belongs at wrongIdx
      const targetOrder = wrongIdx + 1
      const targetIdx = steps.findIndex((s) => s.order === targetOrder)

      if (targetIdx !== -1) {
        const arr = [...steps]
        // Swap them so the correct step is placed at wrongIdx
        ;[arr[wrongIdx], arr[targetIdx]] = [arr[targetIdx], arr[wrongIdx]]
        setSteps(arr)
        setHintsUsed((h) => h + 1)
      }
    }
  }

  if (finished) {
    const correct = steps.every((s, i) => s.order === i + 1)
    const finalScore = correct ? 100 : Math.round((steps.filter((s, i) => s.order === i + 1).length / steps.length) * 100)
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">{correct ? '🎉' : '💪'}</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{correct ? 'Ordre Correct!' : 'Presque!'}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">Score: {finalScore}%</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1 mb-4"><Zap size={18} /> +{Math.round((finalScore / 100) * 50)} XP</p>
        {hintsUsed > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Indices utilisés : {hintsUsed}/3</p>
        )}
        <button onClick={onBack} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">Retour</button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm transition-all duration-200">
          <ArrowLeft size={16} /> Retour
        </button>
        {hintsUsed < 3 && (
          <button
            onClick={useHint}
            className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
          >
            <HelpCircle size={14} /> Placer une étape ({3 - hintsUsed} restants)
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{game.title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Remettez les étapes dans le bon ordre</p>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 animate-in fade-in duration-200">
              <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{step.text}</span>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(i)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"><ArrowUp size={14} /></button>
                <button onClick={() => moveDown(i)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"><ArrowDown size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={checkOrder} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
          <Check size={18} /> Vérifier l'ordre
        </button>
      </div>
    </div>
  )
}

