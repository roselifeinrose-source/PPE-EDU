import { useEffect } from 'react'
import { AlertTriangle, X, Check } from 'lucide-react'

export default function DeleteConfirmModal({ open, gameTitle, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Confirmer la suppression</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Voulez-vous vraiment supprimer le jeu <strong className="text-slate-900 dark:text-slate-100">« {gameTitle} »</strong> ?
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Toutes les statistiques associées seront perdues.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          >
            <Check size={16} /> Supprimer
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
