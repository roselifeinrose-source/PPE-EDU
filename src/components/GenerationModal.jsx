import { useEffect } from 'react'
import { Loader2, Check, Sparkles, FileText, Brain, Puzzle, Rocket } from 'lucide-react'

const STEPS = [
  { key: 'analyzing', label: 'Analyse du cours...', icon: FileText },
  { key: 'generating', label: 'Génération des questions...', icon: Brain },
  { key: 'verifying', label: 'Vérification des réponses...', icon: Puzzle },
  { key: 'finalizing', label: 'Finalisation du jeu...', icon: Rocket },
]

export default function GenerationModal({ open, progress, error, onClose }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape' && onClose) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const isComplete = progress === 'done'
  const isError = !!error
  const activeIndex = STEPS.findIndex((s) => s.key === progress)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <Sparkles size={20} className={isComplete ? 'text-emerald-500' : isError ? 'text-red-500' : 'text-indigo-500'} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isComplete ? 'Terminé !' : isError ? 'Erreur' : 'Création du jeu'}
          </h2>
        </div>

        <div className="p-6 space-y-3">
          {STEPS.map((step) => {
            const Icon = step.icon
            const stepIndex = STEPS.findIndex((s) => s.key === step.key)
            const isVisible = activeIndex >= 0 && stepIndex <= activeIndex
            const isActive = step.key === progress && !isComplete && !isError
            const isDone = isComplete || (isVisible && stepIndex < activeIndex)

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-2'
                } ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50'
                    : isDone
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isDone
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                    : isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}>
                  {isDone ? <Check size={14} /> : isActive ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
                </div>
                <span className={`text-sm font-medium ${
                  isDone
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : isActive
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
            )
          })}

          {isError && (
            <div className="mt-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
