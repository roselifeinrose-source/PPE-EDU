import { useEffect, useState, useRef } from 'react'
import { Zap, X } from 'lucide-react'

export default function LevelUpToast({ level, onDone }) {
  const [visible, setVisible] = useState(false)
  const prevLevelRef = useRef(level)
  const timerRef = useRef(null)

  useEffect(() => {
    if (level && prevLevelRef.current !== level) {
      setVisible(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setVisible(false)
        onDone?.()
      }, 4000)
    }
    prevLevelRef.current = level
    return () => clearTimeout(timerRef.current)
  }, [level, onDone])

  if (!visible || !level) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Zap size={20} className="text-yellow-300" />
        </div>
        <div>
          <div className="text-sm font-bold">Félicitations !</div>
          <div className="text-xs opacity-90">Niveau {level} atteint !</div>
        </div>
        <button onClick={() => { setVisible(false); onDone?.() }} className="ml-2 p-1 rounded-lg hover:bg-white/20 transition-all">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
