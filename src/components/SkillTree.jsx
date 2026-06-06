import { useMemo } from 'react'
import { Lock, Award, Shield, Network, Cpu, Database, Binary } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

const SUBJECT_NODES = [
  { id: 'arch', name: 'Architecture', desc: 'Composants et périphériques', icon: Cpu, topic: 'Architecture', reqXp: 0 },
  { id: 'algo', name: 'Algorithmique', desc: 'Séquences et logique', icon: Binary, topic: 'Algorithmique', reqXp: 250 },
  { id: 'net', name: 'Réseaux', desc: 'Adresses IP et Internet', icon: Network, topic: 'Réseaux', reqXp: 500 },
  { id: 'sec', name: 'Sécurité', desc: 'Mots de passe et protection', icon: Shield, topic: 'Sécurité', reqXp: 1000 },
  { id: 'db', name: 'Base de données', desc: 'Tables et requêtes SQL', icon: Database, topic: 'Base de données', reqXp: 1500 },
]

export default function SkillTree() {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const games = useGameStore((s) => s.games)
  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)

  const nodes = useMemo(() => {
    if (!student) return []

    return SUBJECT_NODES.map((node) => {
      // Find games matching this topic
      const topicGames = games.filter((g) => g.topic === node.topic)
      const played = topicGames.filter((g) =>
        student.completedGames.some((cg) => cg.gameId === g.id)
      )
      const mastered = topicGames.filter((g) => {
        const best = student.bestScores?.[g.id]
        return best && best === 100
      })

      const isUnlocked = student.totalXP >= node.reqXp
      const isCompleted = topicGames.length > 0 && played.length === topicGames.length
      const isMastered = topicGames.length > 0 && mastered.length === topicGames.length

      return {
        ...node,
        isUnlocked,
        isCompleted,
        isMastered,
        totalGames: topicGames.length,
        playedGames: played.length,
      }
    })
  }, [student, games])

  if (!student) return null

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="mb-6 text-left">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Award size={18} className="text-indigo-500" />
          Mon Arbre de Compétences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Débloquez des branches en accumulant de l'XP et maîtrisez chaque domaine informatique.
        </p>
      </div>

      {/* SVG Connecting lines for background */}
      <div className="relative flex flex-col items-center gap-12 py-4">
        {nodes.map((node, index) => {
          const Icon = node.icon
          const unlocked = node.isUnlocked
          const nextNode = nodes[index + 1]
          
          return (
            <div key={node.id} className="flex flex-col items-center relative z-10 w-full max-w-sm">
              {/* Connector line down to next node */}
              {nextNode && (
                <div
                  className={`absolute top-16 w-0.5 h-12 -z-10 ${
                    nextNode.isUnlocked
                      ? 'bg-gradient-to-b from-indigo-500 to-indigo-300'
                      : 'bg-slate-200 dark:bg-slate-700 border-dashed border-l-2'
                  }`}
                />
              )}

              <div
                className={`flex items-center gap-4 w-full p-4 rounded-2xl border transition-all duration-300 ${
                  unlocked
                    ? node.isMastered
                      ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/10 shadow-md shadow-amber-500/5'
                      : 'border-indigo-150 dark:border-indigo-900 bg-slate-50 dark:bg-slate-900/60'
                    : 'border-slate-200 dark:border-slate-750 bg-slate-100 dark:bg-slate-900/20 opacity-50'
                }`}
              >
                {/* Node icon badge */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300 ${
                    unlocked
                      ? node.isMastered
                        ? 'bg-amber-400 border-amber-300 text-white'
                        : node.isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-650 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {unlocked ? <Icon size={22} /> : <Lock size={20} />}
                </div>

                <div className="flex-1 text-left min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {node.name}
                    {unlocked && node.isMastered && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                        ★ Maître
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{node.desc}</p>
                  
                  {unlocked ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            node.isMastered ? 'bg-amber-400' : 'bg-indigo-500'
                          }`}
                          style={{
                            width: `${
                              node.totalGames > 0
                                ? (node.playedGames / node.totalGames) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-555 font-semibold shrink-0">
                        {node.playedGames}/{node.totalGames} défis
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">
                      Débloque à {node.reqXp} XP (Actuel : {student.totalXP} XP)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
