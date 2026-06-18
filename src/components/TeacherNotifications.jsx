import { useState, useEffect } from 'react'
import { Bell, X, Zap, Award } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import { getLevel } from '../constants'

export default function TeacherNotifications() {
  const students = useGameStore((s) => s.students)
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    const prev = { ...students }
    const interval = setInterval(() => {
      const current = useGameStore.getState().students
      const newNotifs = []
      for (const s of current) {
        const p = prev[s.id]
        if (!p) continue
        if (getLevel(s.totalXP) > getLevel(p.totalXP)) {
          newNotifs.push({ id: `n${Date.now()}_${s.id}`, type: 'levelup', student: s.name, level: getLevel(s.totalXP), time: new Date().toISOString() })
        }
        if (s.completedGames.length > p.completedGames.length) {
          const last = s.completedGames[s.completedGames.length - 1]
          const game = useGameStore.getState().games.find((g) => g.id === last.gameId)
          newNotifs.push({ id: `n${Date.now()}_${s.id}_game`, type: 'game_completed', student: s.name, game: game?.title || 'Jeu', score: last.score, time: new Date().toISOString() })
        }
      }
      if (newNotifs.length > 0) {
        setNotifications((prev) => [...newNotifs, ...prev].slice(0, 50))
      }
      for (const s of current) {
        prev[s.id] = { totalXP: s.totalXP, completedGames: s.completedGames.length }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [students])

  const unread = notifications.length

  const formatTime = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return "à l'instant"
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                >
                  Tout effacer
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">Aucune notification</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'levelup' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                      }`}>
                        {n.type === 'levelup' ? (
                          <Zap size={14} className="text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Award size={14} className="text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-900 dark:text-slate-100">
                          <span className="font-semibold">{n.student}</span>
                          {n.type === 'levelup'
                            ? ` a atteint le niveau ${n.level} !`
                            : ` a terminé "${n.game}" avec ${n.score}%`
                          }
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formatTime(n.time)}</p>
                      </div>
                      <button
                        onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                        className="p-0.5 rounded text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-all shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
