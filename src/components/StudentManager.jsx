import { useState } from 'react'
import { Users, Plus, Trash2, Pencil, Search, Check, X, AlertTriangle } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import { getLevel } from '../constants'

export default function StudentManager() {
  const students = useGameStore((s) => s.students)
  const groups = useGameStore((s) => s.groups)
  const addStudent = useGameStore((s) => s.addStudent)
  const removeStudent = useGameStore((s) => s.removeStudent)
  const updateStudent = useGameStore((s) => s.updateStudent)

  const [newName, setNewName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [deletingStudent, setDeletingStudent] = useState(null)

  const handleAdd = () => {
    if (!newName.trim()) return
    addStudent({ name: newName.trim() })
    setNewName('')
  }

  const startEdit = (student) => {
    setEditingId(student.id)
    setEditName(student.name)
  }

  const saveEdit = () => {
    if (editName.trim() && editingId) {
      updateStudent(editingId, { name: editName.trim() })
    }
    setEditingId(null)
    setEditName('')
  }

  const confirmDelete = () => {
    if (deletingStudent) {
      removeStudent(deletingStudent.id)
      setDeletingStudent(null)
    }
  }

  const filtered = searchQuery
    ? students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : students

  const getGroupName = (groupId) => groups.find((g) => g.id === groupId)?.name || '—'

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users size={16} className="text-indigo-500" />
          Gestion des Élèves
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({students.length})</span>
        </h3>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un élève..."
          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nom du nouvel élève"
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
            {searchQuery ? 'Aucun élève trouvé.' : 'Aucun élève inscrit.'}
          </p>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.avatar?.color || 'from-slate-400 to-slate-600'} flex items-center justify-center text-base shrink-0`}>
                <span>{s.avatar?.emoji || '👤'}</span>
              </div>

              <div className="flex-1 min-w-0">
                {editingId === s.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      className="flex-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all" title="Enregistrer">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all" title="Annuler">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{s.name}</div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                <span>Niv. {getLevel(s.totalXP)}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{s.totalXP} XP</span>
                <span>Groupe: {getGroupName(s.groupId)}</span>
                <span>{s.completedGames?.length || 0} parties</span>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => startEdit(s)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  title="Modifier"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeletingStudent(s)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Supprimer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeletingStudent(null)}>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Confirmer la suppression</h2>
              </div>
              <button onClick={() => setDeletingStudent(null)} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Voulez-vous vraiment supprimer l'élève <strong className="text-slate-900 dark:text-slate-100">« {deletingStudent.name} »</strong> ?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Toutes ses données (XP, parties, achievements) seront perdues.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={confirmDelete} className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all">
                <Check size={16} /> Supprimer
              </button>
              <button onClick={() => setDeletingStudent(null)} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
