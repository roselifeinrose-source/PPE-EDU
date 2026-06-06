import { useMemo } from 'react'
import { Trophy, Medal, Sparkles } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import useGameStore from '../store/useGameStore'

const rankIcons = [Trophy, Medal, null]

export default function Leaderboard() {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const students = useGameStore((s) => s.students)
  const ranked = useMemo(() => [...students].sort((a, b) => b.totalXP - a.totalXP), [students])

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Trophy size={16} className="text-amber-500" />
        Classement
      </h3>
      <div className="space-y-1">
        {ranked.map((student, i) => {
          const RankIcon = rankIcons[i] || null
          const isMe = student.id === currentStudentId
          return (
            <div
              key={student.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-350 ${
                isMe ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
                  {RankIcon ? <RankIcon size={14} className={i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-amber-705'} /> : `#${i + 1}`}
                </div>
                <span className={`font-medium ${isMe ? 'text-indigo-750 dark:text-indigo-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                  {student.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isMe && <Sparkles size={11} className="text-indigo-500 animate-pulse" />}
                <span className={`text-xs font-medium ${isMe ? 'text-indigo-650 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {student.totalXP} XP
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
