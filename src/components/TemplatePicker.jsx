import { useState } from 'react'
import { X, FileText, Puzzle, ListOrdered, Search } from 'lucide-react'
import { gameTemplates, templateTopics } from '../data/gameTemplates'

const typeIcons = { quiz: FileText, puzzle: Puzzle, sequencing: ListOrdered }
const typeLabels = { quiz: 'Quiz', puzzle: 'Puzzle', sequencing: 'Séquencement' }

export default function TemplatePicker({ open, onClose, onSelect }) {
  const [search, setSearch] = useState('')
  const [filterTopic, setFilterTopic] = useState('all')

  if (!open) return null

  const filtered = gameTemplates.filter((t) => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
    const matchesTopic = filterTopic === 'all' || t.topic === filterTopic
    return matchesSearch && matchesTopic
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Modèles de jeux</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un modèle..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400" />
          </div>
          <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            <option value="all">Tous les sujets</option>
            {templateTopics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Aucun modèle trouvé.</p>
          ) : (
            <div className="grid gap-3">
              {filtered.map((tpl) => {
                const Icon = typeIcons[tpl.gameType] || FileText
                return (
                  <button key={tpl.id} onClick={() => { onSelect(tpl); onClose() }}
                    className="text-left bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{tpl.title}</h3>
                          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded whitespace-nowrap">{typeLabels[tpl.gameType]}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tpl.description}</p>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                          {tpl.topic} · {tpl.gameType === 'quiz' ? `${tpl.questions.length} questions` : tpl.gameType === 'puzzle' ? `${tpl.pairs.length} paires` : `${tpl.steps.length} étapes`}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
