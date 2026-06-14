import { useMemo } from 'react'
import { TrendingUp, Users } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import useGameStore from '../store/useGameStore'

export default function InterGroupLeaderboard() {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const students = useGameStore((s) => s.students)
  const groups = useGameStore((s) => s.groups)

  const groupStats = useMemo(() => {
    return groups.map((group) => {
      const members = students.filter((s) => s.groupId === group.id)
      const totalXP = members.reduce((sum, s) => sum + s.totalXP, 0)
      const avgXP = members.length ? Math.round(totalXP / members.length) : 0
      const avgLevel = members.length ? Math.round(members.reduce((sum, s) => sum + s.level, 0) / members.length) : 0
      const totalGames = members.reduce((sum, s) => sum + s.completedGames.length, 0)
      return { ...group, members, totalXP, avgXP, avgLevel, totalGames }
    }).sort((a, b) => b.totalXP - a.totalXP)
  }, [groups, students])

  const user = useAuthStore((s) => s.user)
  const myStudent = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Users size={16} className="text-indigo-500" />
        Compétition Inter-Classes
      </h3>

      <div className="space-y-3 mb-4">
        {groupStats.map((group, i) => {
          const isMyGroup = myStudent?.groupId === group.id
          const maxXP = groupStats[0]?.totalXP || 1
          const rankIcons = ['🥇', '🥈', '🥉']
          return (
            <div key={group.id} className={`rounded-xl border p-3 transition-all duration-200 ${isMyGroup ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rankIcons[i] || `#${i+1}`}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{group.name}</span>
                    {isMyGroup && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 rounded font-medium">Ma classe</span>}
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{group.totalXP.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(group.totalXP / maxXP) * 100}%`, backgroundColor: group.color }}
                />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                <span>{group.members.length} élève{group.members.length > 1 ? 's' : ''}</span>
                <span>·</span>
                <span>Moy. {group.avgXP} XP/élève</span>
                <span>·</span>
                <span>Niv. {group.avgLevel} moyen</span>
                <span>·</span>
                <span>{group.totalGames} parties</span>
              </div>
            </div>
          )
        })}
      </div>

      {groupStats.length === 0 && (
        <div className="text-center py-6 text-sm text-slate-400 dark:text-slate-500">
          Créez des groupes dans le tableau de bord enseignant pour voir la compétition inter-classes.
        </div>
      )}

      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <TrendingUp size={11} /> Score total = somme des XP de tous les membres de la classe.
        </p>
      </div>
    </div>
  )
}
