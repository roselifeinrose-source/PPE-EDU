import { useMemo, useState, useEffect } from 'react'
import { MessageSquare, Trophy, Zap, Sword } from 'lucide-react'
import useGameStore from '../store/useGameStore'

export default function ActivityFeed() {
  const activityFeed = useGameStore((s) => s.activityFeed)
  const [nowTime, setNowTime] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setNowTime(Date.now())
    }, 0)
    return () => clearTimeout(t)
  }, [])

  // Generate some realistic mock feed items if feed is empty to make it look alive!
  const displayFeed = useMemo(() => {
    if (activityFeed && activityFeed.length > 0) return activityFeed

    // Fallback/Mock activity feed
    const now = new Date()
    return [
      {
        id: 'mock1',
        type: 'level_up',
        studentName: 'Amina El Amrani',
        detail: 'est passée au Niveau 5 ! 🚀',
        timestamp: new Date(now - 1200000).toISOString() // 20m ago
      },
      {
        id: 'mock2',
        type: 'perfect_score',
        studentName: 'Youssef Benali',
        detail: 'a obtenu 100% sur "Associez les Périphériques" ! 🌟',
        timestamp: new Date(now - 3600000).toISOString() // 1h ago
      },
      {
        id: 'mock3',
        type: 'challenge_sent',
        studentName: 'Mehdi Ouazzani',
        detail: 'a défié Youssef Benali sur "Les Composants de l\'Ordinateur" ⚔️',
        timestamp: new Date(now - 7200000).toISOString() // 2h ago
      }
    ]
  }, [activityFeed])

  const getIcon = (type) => {
    switch (type) {
      case 'level_up':
        return <Trophy className="text-amber-500" size={14} />
      case 'perfect_score':
        return <Zap className="text-emerald-500 fill-emerald-500" size={14} />
      case 'challenge_sent':
      case 'challenge_resolved':
        return <Sword className="text-indigo-500" size={14} />
      default:
        return <MessageSquare className="text-slate-500" size={14} />
    }
  }

  const formatTime = (isoString) => {
    if (!nowTime) return ''
    try {
      const diffMs = nowTime - new Date(isoString).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return "À l'instant"
      if (diffMins < 60) return `Il y a ${diffMins} min`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `Il y a ${diffHours} h`
      return new Date(isoString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    } catch {
      return ''
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-indigo-500" />
        Activité de la classe
      </h3>
      <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
        {displayFeed.map((item) => (
          <div key={item.id} className="flex gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{item.studentName}</span>{' '}
                {item.detail}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-555 block mt-0.5">
                {formatTime(item.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
