import { useState } from 'react'
import { Trophy, Star, Lock, Sparkles, Download } from 'lucide-react'
import { ACHIEVEMENT_DEFS } from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import useGameStore from '../store/useGameStore'
import { playSound } from '../utils/soundService'

function downloadBadgeSVG(def) {
  playSound.click()
  const svgContent = `
<svg xmlns="http://www.w3.org/2050/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="50%" stop-color="#fbf0b9" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.15" />
    </filter>
  </defs>
  <circle cx="100" cy="100" r="90" fill="url(#gold)" stroke="#d97706" stroke-width="5" filter="url(#shadow)" />
  <circle cx="100" cy="100" r="80" fill="none" stroke="#fef3c7" stroke-width="2" stroke-dasharray="5,4" />
  
  <g transform="translate(100, 85)">
    <circle cx="0" cy="0" r="45" fill="#ffffff" fill-opacity="0.9" />
    <text x="0" y="10" font-family="Segoe UI, -apple-system, sans-serif" font-size="45" text-anchor="middle" dominant-baseline="middle">${def.icon}</text>
  </g>

  <rect x="25" y="142" width="150" height="26" rx="13" fill="#1e1b4b" stroke="#4f46e5" stroke-width="1.5" />
  <text x="100" y="159" font-family="Segoe UI, -apple-system, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">${def.label}</text>
  <text x="100" y="186" font-family="Segoe UI, -apple-system, sans-serif" font-size="8" font-weight="bold" fill="#78350f" text-anchor="middle">CHAMPION INFORGAMES</text>
</svg>
  `.trim()

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `badge_${def.id}.svg`
  link.click()
  URL.revokeObjectURL(url)
}

export default function AchievementSystem({ compact = false }) {
  const { currentStudentId, user } = useAuthStore()
  const students = useGameStore((s) => s.students)
  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)
  const [showAll, setShowAll] = useState(false)

  if (!student) return null

  const unlocked = student.achievements || []
  const unlockedIds = new Set(unlocked.map((a) => a.id))
  const total = ACHIEVEMENT_DEFS.length
  const unlockedCount = unlocked.length

  const visible = showAll ? ACHIEVEMENT_DEFS : ACHIEVEMENT_DEFS.slice(0, compact ? 6 : 10)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          Achievements
          <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-semibold">
            {unlockedCount}/{total}
          </span>
        </h3>
        {!compact && (
          <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${(unlockedCount / total) * 100}%` }} />
          </div>
        )}
      </div>

      <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'} gap-2.5`}>
        {visible.map((def) => {
          const isUnlocked = unlockedIds.has(def.id)
          const unlockedData = unlocked.find((a) => a.id === def.id)
          return (
            <div
              key={def.id}
              title={isUnlocked ? `Débloqué le ${new Date(unlockedData?.unlockedAt).toLocaleDateString('fr-FR')}` : def.desc}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 group ${
                isUnlocked
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-700/50'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-50'
              }`}
            >
              {isUnlocked && (
                <div className="absolute -top-1 -right-1">
                  <Sparkles size={10} className="text-amber-500 animate-pulse" />
                </div>
              )}
              <span className={`text-2xl ${!isUnlocked && 'grayscale'}`}>{def.icon}</span>
              <div>
                <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">{def.label}</p>
                {!compact && <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{def.desc}</p>}
              </div>

              {/* Hover actions */}
              {isUnlocked && (
                <button
                  type="button"
                  onClick={() => downloadBadgeSVG(def)}
                  title="Télécharger l'image"
                  className="absolute bottom-2 right-2 p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                >
                  <Download size={10} />
                </button>
              )}

              {!isUnlocked && <Lock size={10} className="text-slate-400 absolute bottom-2 right-2" />}
              {isUnlocked && !compact && (
                <div className="group-hover:hidden absolute bottom-2 right-2">
                  <Star size={10} className="text-amber-500 fill-amber-400" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {ACHIEVEMENT_DEFS.length > (compact ? 6 : 10) && !compact && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 w-full text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium py-1"
        >
          {showAll ? 'Voir moins' : `Voir tous (${total - visible.length} de plus)`}
        </button>
      )}
    </div>
  )
}
