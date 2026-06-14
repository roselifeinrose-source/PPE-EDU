import { useState } from 'react'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'
import useGameStore from '../../store/useGameStore'
import GroupManager from '../../components/GroupManager'

export default function TeacherGroupsPage() {
  const groups = useGameStore((s) => s.groups)
  const students = useGameStore((s) => s.students)
  const assignStudentToGroup = useGameStore((s) => s.assignStudentToGroup)
  const [expandedGroup, setExpandedGroup] = useState(null)

  const unassigned = students.filter((s) => !s.groupId)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Groupes & Élèves</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupManager />

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Users size={16} className="text-indigo-500" />
            Détails des Groupes
          </h3>

          <div className="space-y-2">
            {groups.map((group) => {
              const members = students.filter((s) => s.groupId === group.id)
              const isExpanded = expandedGroup === group.id
              return (
                <div key={group.id} className="border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{group.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{members.length} élève{members.length !== 1 ? 's' : ''}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-700">
                      {members.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500 py-2">Aucun élève dans ce groupe.</p>
                      ) : (
                        <div className="space-y-1 pt-2">
                          {members.map((s) => (
                            <div key={s.id} className="flex items-center justify-between text-xs py-1">
                              <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-500 dark:text-slate-400">Niv. {s.level}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{s.totalXP} XP</span>
                                <span className="text-slate-400 dark:text-slate-500">{s.completedGames?.length || 0} parties</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {unassigned.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Non assignés ({unassigned.length})</p>
              <div className="space-y-1">
                {unassigned.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
                    <select
                      value=""
                      onChange={(e) => assignStudentToGroup(s.id, e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-600 dark:text-slate-400 focus:outline-none"
                    >
                      <option value="">Assigner à...</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
