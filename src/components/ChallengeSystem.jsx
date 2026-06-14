import { useState } from 'react'
import { Sword, Check, ChevronDown, ChevronUp } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

export default function ChallengeSystem({ onPlayChallenge }) {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const students = useGameStore((s) => s.students)
  const games = useGameStore((s) => s.games)
  const challenges = useGameStore((s) => s.challenges)
  const sendChallenge = useGameStore((s) => s.sendChallenge)
  const [expanded, setExpanded] = useState(false)
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedOpponent, setSelectedOpponent] = useState('')
  const [sent, setSent] = useState(false)

  const opponents = students.filter((s) => s.id !== currentStudentId)
  const quizGames = games.filter((g) => g.gameType === 'quiz' && !g.archived)

  const myChallenges = (challenges || []).filter((c) => c.fromId === currentStudentId || c.toId === currentStudentId)

  const handleSend = () => {
    if (!selectedOpponent || !selectedGame) return
    sendChallenge(currentStudentId, selectedOpponent, selectedGame)
    setSent(true)
    setSelectedGame('')
    setSelectedOpponent('')
    setTimeout(() => setSent(false), 3000)
  }

  const getChallengeLine = (ch) => {
    const from = students.find((s) => s.id === ch.fromId)
    const to = students.find((s) => s.id === ch.toId)
    const game = games.find((g) => g.id === ch.gameId)
    const isFromMe = ch.fromId === currentStudentId
    const statusColors = {
      pending: 'text-amber-600 dark:text-amber-400',
      accepted: 'text-indigo-600 dark:text-indigo-400',
      resolved: 'text-emerald-600 dark:text-emerald-400',
    }
    const statusLabels = { pending: 'En attente', accepted: 'En cours', resolved: 'Terminé' }
    const winner = ch.status === 'resolved'
      ? (ch.fromScore ?? 0) >= (ch.toScore ?? 0) ? from?.name : to?.name
      : null

    const needsPlay = 
      (ch.toId === currentStudentId && ch.toScore === null) ||
      (ch.fromId === currentStudentId && ch.fromScore === null);

    return (
      <div key={ch.id} className="flex items-center justify-between gap-2 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-slate-750 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{isFromMe ? 'Vous' : from?.name}</span>
            <span className="text-slate-400"> vs </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{isFromMe ? to?.name : 'Vous'}</span>
          </div>
          <div className="text-[10px] text-slate-550 dark:text-slate-400 truncate">{game?.title || ch.gameId}</div>
          {ch.status === 'resolved' && (
            <div className="text-[10px] mt-0.5">
              <span className="text-slate-500">{from?.name}: {ch.fromScore}% · {to?.name}: {ch.toScore}%</span>
              {winner && <span className="ml-1 text-amber-500 font-medium">🏆 {winner}</span>}
            </div>
          )}
          {ch.status !== 'resolved' && (
            <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
              {ch.fromScore !== null ? `${from?.name} a joué` : `${from?.name} n'a pas joué`} · {ch.toScore !== null ? `${to?.name} a joué` : `${to?.name} n'a pas joué`}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {needsPlay ? (
            <button
              onClick={() => onPlayChallenge(ch.gameId, ch.id)}
              className="bg-red-500 hover:bg-red-650 text-white text-[10px] font-bold px-2 py-1 rounded transition-all duration-200"
            >
              Relever
            </button>
          ) : (
            <span className={`text-[10px] font-semibold ${statusColors[ch.status] || ''}`}>
              {statusLabels[ch.status] || ch.status}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <Sword size={16} className="text-red-500 dark:text-red-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Défis entre Élèves</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {myChallenges.length === 0 ? 'Défiez vos camarades !' : `${myChallenges.length} défi${myChallenges.length > 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        {myChallenges.filter((c) => c.status === 'pending' && c.toId === currentStudentId).length > 0 && (
          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center mr-1">
            {myChallenges.filter((c) => c.status === 'pending' && c.toId === currentStudentId).length}
          </span>
        )}
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 p-4 space-y-4">
          {/* Send challenge */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Sword size={12} /> Envoyer un défi</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              >
                <option value="">Adversaire...</option>
                {opponents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/30"
              >
                <option value="">Jeu...</option>
                {quizGames.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
            {sent ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Check size={13} /> Défi envoyé !
              </div>
            ) : (
              <button
                onClick={handleSend}
                disabled={!selectedOpponent || !selectedGame}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2 rounded-lg text-xs font-bold transition-all duration-200"
              >
                ⚔️ Lancer le défi
              </button>
            )}
            {opponents.length === 0 && (
              <p className="text-[10px] text-slate-400">Aucun camarade disponible pour l'instant.</p>
            )}
          </div>

          {/* Challenge history */}
          {myChallenges.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Mes défis</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {myChallenges.map(getChallengeLine)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
