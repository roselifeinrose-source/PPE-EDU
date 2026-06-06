import { useState } from 'react'
import { ScrollText, Trash2, ChevronDown, ChevronUp, Gamepad2, UserPlus, Edit3 } from 'lucide-react'
import useGameStore from '../store/useGameStore'

const ACTION_LABELS = {
  game_created: { label: 'Jeu créé', icon: Gamepad2, color: 'text-emerald-600 dark:text-emerald-400' },
  game_deleted: { label: 'Jeu supprimé', icon: Trash2, color: 'text-red-600 dark:text-red-400' },
  student_added: { label: 'Élève ajouté', icon: UserPlus, color: 'text-indigo-600 dark:text-indigo-400' },
}

export default function ActivityLogs() {
  const activityLogs = useGameStore((s) => s.activityLogs)
  const [expanded, setExpanded] = useState(false)

  const visibleLogs = expanded ? activityLogs : activityLogs.slice(0, 10)

  const formatTime = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return "à l'instant"
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
        <ScrollText size={16} className="text-indigo-500" />
        Journal d'Activité
      </h3>

      {activityLogs.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
          Aucune activité enregistrée.
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            {visibleLogs.map((log) => {
              const action = ACTION_LABELS[log.action] || { label: log.action, icon: Edit3, color: 'text-slate-500 dark:text-slate-400' }
              const Icon = action.icon
              return (
                <div key={log.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs">
                  <Icon size={12} className={`${action.color} shrink-0`} />
                  <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{log.details}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{formatTime(log.timestamp)}</span>
                </div>
              )
            })}
          </div>

          {activityLogs.length > 10 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mt-3 transition-all"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Voir moins' : `Voir tout (${activityLogs.length})`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
