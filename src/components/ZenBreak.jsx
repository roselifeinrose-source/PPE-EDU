import { useState, useEffect } from 'react'
import { Wind, Play, Pause, X, RotateCcw } from 'lucide-react'
import { playSound } from '../utils/soundService'

export default function ZenBreak({ onClose }) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState('inhale') // inhale, hold, exhale
  const [secondsLeft, setSecondsLeft] = useState(4)
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    let timer = null
    if (isActive) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Transition to next phase
            if (phase === 'inhale') {
              setPhase('hold')
              return 7
            } else if (phase === 'hold') {
              setPhase('exhale')
              return 8
            } else {
              setPhase('inhale')
              setCycleCount((c) => c + 1)
              return 4
            }
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isActive, phase])

  const toggleActive = () => {
    playSound.click()
    setIsActive(!isActive)
  }

  const reset = () => {
    playSound.click()
    setIsActive(false)
    setPhase('inhale')
    setSecondsLeft(4)
    setCycleCount(0)
  }

  // Animation scaling
  const getScaleClass = () => {
    if (!isActive) return 'scale-90 bg-indigo-500/20'
    if (phase === 'inhale') return 'scale-125 bg-gradient-to-r from-indigo-500 to-cyan-500 duration-[4000ms]'
    if (phase === 'hold') return 'scale-125 bg-gradient-to-r from-cyan-500 to-teal-500 duration-[7000ms]'
    return 'scale-90 bg-gradient-to-r from-teal-500 to-indigo-500 duration-[8000ms]'
  }

  const getPhaseText = () => {
    if (!isActive) return 'Prêt à vous détendre ?'
    if (phase === 'inhale') return 'Inspirez...'
    if (phase === 'hold') return 'Bloquez...'
    return 'Expirez lentement...'
  }

  const getPhaseColor = () => {
    if (phase === 'inhale') return 'text-indigo-600 dark:text-indigo-400'
    if (phase === 'hold') return 'text-cyan-600 dark:text-cyan-400'
    return 'text-teal-600 dark:text-teal-400'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl p-6 text-center relative overflow-hidden">
        <button
          onClick={() => { playSound.click(); onClose() }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all duration-200"
        >
          <X size={20} />
        </button>

        <Wind className="mx-auto text-indigo-500 mb-2 animate-pulse" size={32} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Pause Zen</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Technique 4-7-8 pour calmer le stress et rester concentré.</p>

        {/* Breathing Circle Container */}
        <div className="h-56 flex items-center justify-center relative mb-6">
          {/* Animated scaling circle */}
          <div className={`w-36 h-36 rounded-full transition-transform ease-in-out flex items-center justify-center shadow-lg ${getScaleClass()}`}>
            <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-800 flex flex-col items-center justify-center shadow-inner">
              <span className={`text-4xl font-extrabold transition-all duration-300 ${getPhaseColor()}`}>
                {isActive ? secondsLeft : '🧘'}
              </span>
            </div>
          </div>
        </div>

        <h3 className={`text-lg font-bold transition-all duration-500 mb-2 ${getPhaseColor()}`}>
          {getPhaseText()}
        </h3>

        <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
          Cycles complétés : {cycleCount}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleActive}
            className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm text-white ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            {isActive ? 'Pause' : 'Commencer'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-250 rounded-xl text-xs font-bold transition-all duration-200"
          >
            <RotateCcw size={14} /> Recommencer
          </button>
        </div>
      </div>
    </div>
  )
}
