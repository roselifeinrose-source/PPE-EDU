import { Play, Radio, Maximize, Edit3, Copy, Archive, Trash2, CheckSquare, Square, Star, Clock, Tag, BookOpen, Puzzle, ListOrdered, Brain, ArrowDownFromLine } from 'lucide-react'

const TYPE_CONFIG = {
  quiz: { label: 'Quiz', icon: BookOpen, badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  puzzle: { label: 'Puzzle', icon: Puzzle, badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  sequencing: { label: 'Séquencement', icon: ListOrdered, badge: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
  memory: { label: 'Memory', icon: Brain, badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  cloze: { label: 'Texte à trous', icon: BookOpen, badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  dropping: { label: 'Tri par chute', icon: ArrowDownFromLine, badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function GameCard({ game, selected, onToggleSelect, onPreview, onEdit, onDelete, onDuplicate, onArchive, onSession, onPresent }) {
  const tc = TYPE_CONFIG[game.gameType] || TYPE_CONFIG.quiz

  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-xl p-5 transition-all duration-200 ${
      selected ? 'border-indigo-300 dark:border-indigo-600 ring-1 ring-indigo-200 dark:ring-indigo-800'
        : game.archived ? 'border-slate-200 dark:border-slate-700 opacity-60'
          : 'border-slate-200 dark:border-slate-700 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <button onClick={() => onToggleSelect(game.id)} className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-500 transition-all">
            {selected ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-slate-900 dark:text-slate-100 font-semibold truncate text-sm">{game.title}</h3>
              {game.isSimulation && <span className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">Simulation</span>}
              {game.archived && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">Archivé</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${tc.badge}`}>{tc.label}</span>
              <span className="flex items-center gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star key={s} size={10} className={s <= (game.difficulty === 'easy' ? 1 : game.difficulty === 'hard' ? 3 : 2) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                ))}
              </span>
              {game.topic && <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{game.topic}</span>}
              {game.tags?.length > 0 && (
                <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px]">
                  <Tag size={8} /> {game.tags.join(', ')}
                </span>
              )}
              {game.createdAt && (
                <span className="text-slate-400 dark:text-slate-500 inline-flex items-center gap-1 text-[10px]">
                  <Clock size={8} /> {formatDate(game.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-3">
          <div>{game.analytics.attempts} tentative{game.analytics.attempts > 1 ? 's' : ''}</div>
          <div className="text-indigo-600 dark:text-indigo-400 font-medium">{game.analytics.averageScore}% moyen</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex-wrap">
        <ActionBtn icon={Play} label="Tester" color="indigo" onClick={() => onPreview(game.id)} />
        <ActionBtn icon={Radio} label="Session" color="red" onClick={() => onSession(game.id)} />
        <ActionBtn icon={Maximize} label="Projeter" color="purple" onClick={() => onPresent(game.id)} />
        <ActionBtn icon={Edit3} label="Modifier" color="amber" onClick={() => onEdit(game)} />
        <ActionBtn icon={Copy} label="Dupliquer" color="emerald" onClick={() => onDuplicate(game.id)} />
        <ActionBtn icon={Archive} label={game.archived ? 'Restaurer' : 'Archiver'} color="slate" onClick={() => onArchive(game.id)} />
        <ActionBtn icon={Trash2} label="Supprimer" color="red" onClick={() => onDelete(game)} />
      </div>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, color, onClick }) {
  const colors = {
    indigo: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
    red: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
    purple: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    amber: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    slate: 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
  }
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${colors[color] || colors.slate}`}
      title={label}
    >
      <Icon size={12} /> {label}
    </button>
  )
}

export { TYPE_CONFIG }
