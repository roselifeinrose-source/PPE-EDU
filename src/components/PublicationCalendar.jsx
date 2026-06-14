import { useState } from 'react'
import { Calendar, Clock, Eye, EyeOff } from 'lucide-react'
import useGameStore from '../store/useGameStore'

export default function PublicationCalendar() {
  const games = useGameStore((s) => s.games)
  const updateGame = useGameStore((s) => s.updateGame)
  const [selectedGame, setSelectedGame] = useState(null)
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')

  const sortedGames = [...games].sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return new Date(a.publishedAt) - new Date(b.publishedAt)
  })

  const now = new Date()

  const handleSchedule = () => {
    if (!selectedGame || !publishDate) return
    const dt = publishTime ? `${publishDate}T${publishTime}:00` : `${publishDate}T08:00:00`
    updateGame(selectedGame, { publishedAt: new Date(dt).toISOString() })
    setSelectedGame(null)
    setPublishDate('')
    setPublishTime('')
  }

  const handleUnschedule = (gameId) => {
    updateGame(gameId, { publishedAt: null })
  }

  const isPublished = (game) => game.publishedAt && new Date(game.publishedAt) <= now
  const isScheduled = (game) => game.publishedAt && new Date(game.publishedAt) > now

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Calendar size={16} className="text-indigo-500" />
        Calendrier de Publication
      </h3>

      <div className="space-y-2 mb-4">
        {sortedGames.map((game) => {
          const published = isPublished(game)
          const scheduled = isScheduled(game)
          return (
            <div key={game.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {published ? (
                  <Eye size={12} className="text-emerald-500 shrink-0" />
                ) : scheduled ? (
                  <Clock size={12} className="text-amber-500 shrink-0" />
                ) : (
                  <EyeOff size={12} className="text-slate-400 shrink-0" />
                )}
                <span className="text-slate-900 dark:text-slate-100 truncate">{game.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {scheduled && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {new Date(game.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                )}
                {game.publishedAt && (
                  <button
                    onClick={() => handleUnschedule(game.id)}
                    className="text-slate-400 hover:text-red-500 transition-all p-0.5"
                    title="Retirer la planification"
                  >
                    <EyeOff size={11} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">Planifier la publication d'un jeu</p>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedGame || ''}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choisir un jeu...</option>
            {games.filter((g) => !g.archived).map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="time"
            value={publishTime}
            onChange={(e) => setPublishTime(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSchedule}
            disabled={!selectedGame || !publishDate}
            className="flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 px-3 py-1.5 rounded-lg transition-all"
          >
            <Calendar size={12} /> Planifier
          </button>
        </div>
      </div>
    </div>
  )
}
