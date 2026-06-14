import { EyeOff, Info } from 'lucide-react'
import useGameStore from '../store/useGameStore'

export default function FogMode() {
  const fogMode = useGameStore((s) => s.fogMode)
  const toggleFogMode = useGameStore((s) => s.toggleFogMode)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
        <EyeOff size={16} className="text-indigo-500" />
        Mode Brouillard
      </h3>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            {fogMode ? 'Scores masqués pour les élèves' : 'Scores visibles pour les élèves'}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Seul l'enseignant voit les résultats
          </p>
        </div>
        <button
          onClick={toggleFogMode}
          className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
            fogMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
          aria-label={fogMode ? 'Désactiver le mode brouillard' : 'Activer le mode brouillard'}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
            fogMode ? 'left-[26px]' : 'left-0.5'
          }`} />
        </button>
      </div>

      <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2">
        <Info size={12} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          En mode brouillard, les scores et classements ne sont pas visibles sur les appareils des élèves. Utile pour les évaluations en classe.
        </p>
      </div>
    </div>
  )
}
