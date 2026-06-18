import { useState } from 'react'
import { Gamepad2, Plus, Trash2, Pencil, Search, Check, X, AlertTriangle, BookOpen, Puzzle, ListOrdered, Brain, ArrowDownFromLine } from 'lucide-react'
import useGameStore from '../store/useGameStore'

const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: BookOpen, badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  puzzle: { label: 'Puzzle', icon: Puzzle, badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  sequencing: { label: 'Séquencement', icon: ListOrdered, badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
  memory: { label: 'Memory', icon: Brain, badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  cloze: { label: 'Texte à trous', icon: BookOpen, badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  dropping: { label: 'Tri par chute', icon: ArrowDownFromLine, badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
}

const EMPTY_CONTENT = {
  quiz: { questions: [{ id: 'q1', question: '', options: ['', '', '', ''], correctIndex: 0 }] },
  puzzle: { pairs: [{ id: 'p1', left: '', right: '' }] },
  sequencing: { steps: [{ id: 's1', order: 1, text: '' }] },
  memory: { pairs: [{ id: 'm1', left: '', right: '' }] },
  cloze: { text: '', blanks: {} },
  dropping: { categories: [{ id: 'c1', label: '' }], items: [{ id: 'i1', name: '', category: 'c1' }] },
}

export default function GameManager() {
  const games = useGameStore((s) => s.games)
  const addGame = useGameStore((s) => s.addGame)
  const removeGame = useGameStore((s) => s.removeGame)
  const updateGame = useGameStore((s) => s.updateGame)

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('quiz')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [deletingGame, setDeletingGame] = useState(null)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const game = {
      id: 'g' + Date.now(),
      createdAt: new Date().toISOString(),
      title: newTitle.trim(),
      subject: 'Informatique',
      topic: 'Général',
      gameType: newType,
      difficulty: 'easy',
      content: JSON.parse(JSON.stringify(EMPTY_CONTENT[newType] || EMPTY_CONTENT.quiz)),
      analytics: { attempts: 0, averageScore: 0, failedConcepts: [] },
    }
    addGame(game)
    setNewTitle('')
  }

  const startEdit = (game) => {
    setEditingId(game.id)
    setEditTitle(game.title)
  }

  const saveEdit = () => {
    if (editTitle.trim() && editingId) {
      updateGame(editingId, { title: editTitle.trim() })
    }
    setEditingId(null)
    setEditTitle('')
  }

  const confirmDelete = () => {
    if (deletingGame) {
      removeGame(deletingGame.id)
      setDeletingGame(null)
    }
  }

  const filtered = searchQuery
    ? games.filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    : games

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Gamepad2 size={16} className="text-indigo-500" />
          Gestion des Jeux
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({games.length})</span>
        </h3>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un jeu..."
          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Titre du nouveau jeu"
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
        >
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">
            {searchQuery ? 'Aucun jeu trouvé.' : 'Aucun jeu créé.'}
          </p>
        ) : (
          filtered.map((g) => {
            const tc = TYPE_CONFIG[g.gameType] || TYPE_CONFIG.quiz
            const Icon = tc.icon
            return (
              <div key={g.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${tc.badge}`}>
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === g.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
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
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{g.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${tc.badge}`}>{tc.label}</span>
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                  <span>{g.topic}</span>
                  <span>{g.analytics?.attempts || 0} tentatives</span>
                  <span>{g.analytics?.averageScore || 0}%</span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => startEdit(g)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                    title="Modifier"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeletingGame(g)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {deletingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeletingGame(null)}>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Confirmer la suppression</h2>
              </div>
              <button onClick={() => setDeletingGame(null)} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Voulez-vous vraiment supprimer le jeu <strong className="text-slate-900 dark:text-slate-100">« {deletingGame.title} »</strong> ?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Toutes les statistiques associées seront perdues.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={confirmDelete} className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all">
                <Check size={16} /> Supprimer
              </button>
              <button onClick={() => setDeletingGame(null)} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
