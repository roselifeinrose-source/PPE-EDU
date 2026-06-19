import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Check, Lock, Play, X, Cpu, Binary, Network, Shield, Database, Award, Zap } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

const TOPIC_NODES = [
  { id: 'arch', name: 'Architecture', desc: 'Composants et périphériques', icon: Cpu, topic: 'Architecture', reqXp: 0, color: 'indigo' },
  { id: 'algo', name: 'Algorithmique', desc: 'Séquences et logique', icon: Binary, topic: 'Algorithmique', reqXp: 250, color: 'violet' },
  { id: 'net', name: 'Réseaux', desc: 'Adresses IP et Internet', icon: Network, topic: 'Réseaux', reqXp: 500, color: 'sky' },
  { id: 'sec', name: 'Sécurité', desc: 'Mots de passe et protection', icon: Shield, topic: 'Sécurité', reqXp: 1000, color: 'emerald' },
  { id: 'db', name: 'Bases de données', desc: 'Tables et requêtes SQL', icon: Database, topic: 'Base de données', reqXp: 1500, color: 'amber' },
]

export default function SkillsTree({ onPlayGame }) {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const games = useGameStore((s) => s.games)
  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)

  const containerRef = useRef(null)
  const centerRef = useRef(null)
  const topicRefs = useRef([])
  const [lines, setLines] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)

  const topicData = useMemo(() => {
    if (!student) return []
    return TOPIC_NODES.map((node) => {
      const topicGames = games.filter((g) => g.topic === node.topic && !g.archived && (g.publishedAt === undefined || (g.publishedAt && new Date(g.publishedAt) <= new Date())))
      const played = topicGames.filter((g) =>
        student.completedGames.some((cg) => cg.gameId === g.id)
      )
      const isUnlocked = student.totalXP >= node.reqXp
      const isCompleted = topicGames.length > 0 && played.length === topicGames.length

      return {
        ...node,
        isUnlocked,
        isCompleted,
        totalGames: topicGames.length,
        playedGames: played.length,
        gamesList: topicGames.map((g) => {
          const completed = student.completedGames.find((cg) => cg.gameId === g.id)
          const best = student.bestScores?.[g.id]
          return { ...g, completed: !!completed, bestScore: best ?? null }
        }),
      }
    })
  }, [student, games])

  const updateLines = useCallback(() => {
    const container = containerRef.current
    const center = centerRef.current
    if (!container || !center) return

    const cRect = center.getBoundingClientRect()
    const contRect = container.getBoundingClientRect()
    const cx = cRect.left + cRect.width / 2 - contRect.left
    const cy = cRect.top + cRect.height / 2 - contRect.top

    const newLines = []

    topicRefs.current.forEach((el, i) => {
      if (!el) return
      const tRect = el.getBoundingClientRect()
      const tx = tRect.left + tRect.width / 2 - contRect.left
      const ty = tRect.top + tRect.height / 2 - contRect.top

      const tData = topicData[i]
      const unlocked = tData?.isUnlocked

      newLines.push({
        id: `center-${i}`,
        x1: cx, y1: cy, x2: tx, y2: ty,
        active: unlocked,
      })

      const gameContainer = el.querySelector('[data-games]')
      if (gameContainer) {
        const gameEls = gameContainer.querySelectorAll('[data-game]')

        gameEls.forEach((gEl) => {
          const gRect = gEl.getBoundingClientRect()
          const gx = gRect.left + gRect.width / 2 - contRect.left
          const gy = gRect.top + gRect.height / 2 - contRect.top
          newLines.push({
            id: `topic-${i}-game-${gEl.dataset.game}`,
            x1: tx, y1: ty, x2: gx, y2: gy,
            active: unlocked,
          })
        })
      }
    })

    setLines(newLines)
  }, [topicData])

  useEffect(() => {
    const timer = setTimeout(updateLines, 100)
    window.addEventListener('resize', updateLines)
    return () => { clearTimeout(timer); window.removeEventListener('resize', updateLines) }
  }, [updateLines])

  useEffect(() => {
    if (topicData.length > 0) {
      const timer = setTimeout(updateLines, 300)
      return () => clearTimeout(timer)
    }
  }, [topicData, updateLines])

  if (!student) return null

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
      <div className="mb-4 text-left">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award size={18} className="text-indigo-500" />
          Arbre de Compétences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Débloquez des branches en accumulant de l'XP. Cliquez sur un nœud pour lancer un défi.
        </p>
      </div>

      <div ref={containerRef} className="relative w-full" style={{ minHeight: 480 }}>
        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minHeight: 480 }}>
          {lines.map((line) => (
            <line
              key={line.id}
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={line.active ? '#6366f1' : '#cbd5e1'}
              strokeWidth={line.active ? 2 : 1}
              strokeDasharray={line.active ? 'none' : '4 4'}
              strokeLinecap="round"
              className="transition-all duration-500 dark:stroke-slate-600"
            />
          ))}
        </svg>

        {/* Center Node */}
        <div className="flex justify-center pt-4 pb-8 relative z-10">
          <div
            ref={centerRef}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border-2 border-indigo-500 dark:border-indigo-400">
              <Zap size={32} className="text-white" />
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Informatique</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{student.totalXP} XP total</p>
            </div>
          </div>
        </div>

        {/* Topic Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10 px-2">
          {topicData.map((topic, i) => {
            const Icon = topic.icon
            return (
              <div
                key={topic.id}
                ref={(el) => { topicRefs.current[i] = el }}
                className="flex flex-col items-center"
              >
                {/* Topic Node */}
                <button
                  onClick={() => setSelectedNode(topic)}
                  disabled={!topic.isUnlocked}
                  className={`group relative w-full p-3 rounded-xl border transition-all duration-300 ${
                    topic.isUnlocked
                      ? topic.isCompleted
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 hover:shadow-md hover:scale-[1.03]'
                        : 'border-indigo-200 dark:border-indigo-800 bg-slate-50 dark:bg-slate-900/60 hover:shadow-md hover:scale-[1.03] hover:border-indigo-400 dark:hover:border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/20 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                        topic.isUnlocked
                          ? topic.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-indigo-600 text-white group-hover:scale-110'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {topic.isUnlocked ? <Icon size={20} /> : <Lock size={18} />}
                    </div>
                    <p className={`text-xs font-semibold leading-tight ${topic.isUnlocked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                      {topic.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{topic.desc}</p>

                    {topic.isUnlocked ? (
                      <div className="w-full mt-2">
                        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${topic.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${topic.totalGames > 0 ? (topic.playedGames / topic.totalGames) * 100 : 0}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                          {topic.playedGames}/{topic.totalGames} défis
                        </p>
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                        🔒 {topic.reqXp} XP requis
                      </p>
                    )}
                  </div>
                </button>

                {/* Game Sub-Nodes */}
                {topic.isUnlocked && topic.gamesList.length > 0 && (
                  <div data-games className="flex flex-wrap justify-center gap-2 mt-3 w-full">
                    {topic.gamesList.map((game) => (
                      <button
                        key={game.id}
                        data-game={game.id}
                        onClick={() => topic.isUnlocked && onPlayGame?.(game.id)}
                        disabled={!topic.isUnlocked}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all duration-200 ${
                          game.completed
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:scale-105'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-105'
                        }`}
                        title={game.title}
                      >
                        {game.completed ? (
                          <Check size={10} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Play size={10} className="text-slate-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[80px]">{game.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Node Detail Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedNode(null)}>
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedNode.isCompleted
                  ? 'bg-emerald-500 text-white'
                  : selectedNode.isUnlocked
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {selectedNode.isUnlocked ? <selectedNode.icon size={24} /> : <Lock size={22} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedNode.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedNode.desc}</p>
              </div>
            </div>

            {selectedNode.isUnlocked ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progression</span>
                    <span className="font-semibold">{selectedNode.playedGames}/{selectedNode.totalGames} défis</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${selectedNode.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${selectedNode.totalGames > 0 ? (selectedNode.playedGames / selectedNode.totalGames) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {selectedNode.gamesList.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {game.completed ? (
                          <Check size={14} className="text-emerald-500 shrink-0" />
                        ) : (
                          <Play size={14} className="text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{game.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {game.bestScore != null && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{game.bestScore}%</span>
                        )}
                        <button
                          onClick={() => { onPlayGame?.(game.id); setSelectedNode(null) }}
                          className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold transition-colors"
                        >
                          Lancer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedNode.isCompleted && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <Check size={14} className="text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Tous les défis complétés !</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Lock size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Accumulez <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedNode.reqXp} XP</span> pour débloquer cette branche.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  XP actuel : {student.totalXP} XP
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
