import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

export default function ProtectedRoute({ allowedRole, children }) {
  const role = useAuthStore((s) => s.role)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  return children
}
