import { useState } from 'react'
import { Users, Plus, X, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import useGameStore from '../store/useGameStore'

const GROUP_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export default function GroupManager() {
  const groups = useGameStore((s) => s.groups)
  const students = useGameStore((s) => s.students)
  const addGroup = useGameStore((s) => s.addGroup)
  const removeGroup = useGameStore((s) => s.removeGroup)
  const assignStudentToGroup = useGameStore((s) => s.assignStudentToGroup)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(GROUP_COLORS[0])
  const [expandedGroup, setExpandedGroup] = useState(null)

  const handleAdd = () => {
    if (!newName.trim()) return
    addGroup({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor(GROUP_COLORS[0])
    setShowAdd(false)
  }

  const unassigned = students.filter((s) => !s.groupId)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users size={16} className="text-indigo-500" />
          Groupes de Classe
        </h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du groupe (ex: 6ème A)"
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex items-center gap-2 mb-2">
            {GROUP_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-6 h-6 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-800' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex items-center gap-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all">
              <Save size={12} /> Enregistrer
            </button>
            <button onClick={() => setShowAdd(false)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 transition-all">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((group) => {
          const members = students.filter((s) => s.groupId === group.id)
          const isExpanded = expandedGroup === group.id
          return (
            <div key={group.id} className="border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                <button
                  onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left"
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{group.name}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{members.length} élève{members.length !== 1 ? 's' : ''}</span>
                  {isExpanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                </button>
                <button
                  onClick={() => removeGroup(group.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-1"
                  aria-label={`Supprimer le groupe ${group.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-slate-100 dark:border-slate-700">
                  {members.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 py-2">Aucun élève dans ce groupe.</p>
                  ) : (
                    <div className="space-y-1 pt-2">
                      {members.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
                          <button
                            onClick={() => assignStudentToGroup(s.id, null)}
                            className="text-slate-400 hover:text-red-500 transition-all p-0.5"
                            title="Retirer du groupe"
                          >
                            <X size={12} />
                          </button>
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
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Non assignés</p>
          <div className="space-y-1">
            {unassigned.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
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
  )
}
