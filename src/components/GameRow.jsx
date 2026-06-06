import { Play, Radio, Maximize, Edit3, Copy, Archive, Trash2, CheckSquare, Square, Star } from 'lucide-react'

const TYPE_BADGE = {
  quiz: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  puzzle: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  sequencing: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  memory: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  cloze: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  dropping: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
}

const TYPE_LABEL = { quiz: 'Quiz', puzzle: 'Puzzle', sequencing: 'Séquencement', memory: 'Memory', cloze: 'Texte à trous', dropping: 'Tri par chute' }

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function GameRow({ game, selected, onToggleSelect, onPreview, onEdit, onDelete, onDuplicate, onArchive, onSession, onPresent }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border rounded-xl px-4 py-3 transition-all duration-200 ${
      selected ? 'border-indigo-300 dark:border-indigo-600 ring-1 ring-indigo-200 dark:ring-indigo-800'
        : game.archived ? 'border-slate-200 dark:border-slate-700 opacity-60'
          : 'border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-center gap-3">
        <button onClick={() => onToggleSelect(game.id)} className="shrink-0 text-slate-400 hover:text-indigo-500 transition-all">
          {selected ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{game.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${TYPE_BADGE[game.gameType] || TYPE_BADGE.quiz}`}>
              {TYPE_LABEL[game.gameType] || game.gameType}
            </span>
            {game.archived && <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">Archivé</span>}
          </div>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {game.topic && <span className="truncate">{game.topic}</span>}
            <span>{game.analytics.attempts} tentative{game.analytics.attempts > 1 ? 's' : ''}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">{game.analytics.averageScore}%</span>
            {game.createdAt && <span>{formatDate(game.createdAt)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {[1, 2, 3].map((s) => (
            <Star key={s} size={10} className={s <= (game.difficulty === 'easy' ? 1 : game.difficulty === 'hard' ? 3 : 2) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
          ))}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <RowBtn icon={Play} color="text-indigo-600 dark:text-indigo-400" onClick={() => onPreview(game.id)} title="Tester" />
          <RowBtn icon={Radio} color="text-red-600 dark:text-red-400" onClick={() => onSession(game.id)} title="Session" />
          <RowBtn icon={Maximize} color="text-purple-600 dark:text-purple-400" onClick={() => onPresent(game.id)} title="Projeter" />
          <RowBtn icon={Edit3} color="text-amber-600 dark:text-amber-400" onClick={() => onEdit(game)} title="Modifier" />
          <RowBtn icon={Copy} color="text-emerald-600 dark:text-emerald-400" onClick={() => onDuplicate(game.id)} title="Dupliquer" />
          <RowBtn icon={Archive} color="text-slate-500 dark:text-slate-400" onClick={() => onArchive(game.id)} title={game.archived ? 'Restaurer' : 'Archiver'} />
          <RowBtn icon={Trash2} color="text-red-600 dark:text-red-400" onClick={() => onDelete(game)} title="Supprimer" />
        </div>
      </div>
    </div>
  )
}

function RowBtn({ icon: Icon, color, onClick, title }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 ${color}`}
      title={title}
    >
      <Icon size={14} />
    </button>
  )
}
