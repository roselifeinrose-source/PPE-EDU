import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import useNotificationStore from '../store/useNotificationStore'

const ICONS = {
  error: AlertTriangle,
  success: CheckCircle,
  info: Info,
}

const STYLES = {
  error: 'bg-red-600 border-red-700 text-white',
  success: 'bg-emerald-600 border-emerald-700 text-white',
  info: 'bg-indigo-600 border-indigo-700 text-white',
}

export default function Toast() {
  const toasts = useNotificationStore((s) => s.toasts)
  const removeToast = useNotificationStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || AlertTriangle
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-lg text-sm font-medium animate-slide-up ${STYLES[t.type] || STYLES.error}`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="p-0.5 rounded hover:bg-white/20 transition-all shrink-0">
              <X size={14} />
            </button>
          </div>
        )
      })}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.25s ease-out; }
      `}</style>
    </div>
  )
}
