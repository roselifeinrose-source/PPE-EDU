import { useLocation, useNavigate } from 'react-router-dom'
import { Sword, Trophy, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Missions', path: '/dashboard', icon: Sword },
  { label: 'Classement', path: '/leaderboard', icon: Trophy },
  { label: 'Mon Profil', path: '/profile', icon: User },
]

export default function StudentSidebar({ collapsed, onToggle, onSettings }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  return (
    <aside
      className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      <div className="flex-1 py-3 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                } ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}

          <div className={`my-2 border-t border-slate-200 dark:border-slate-700 ${collapsed ? 'mx-1' : ''}`} />

          <button
            onClick={onSettings}
            title={collapsed ? 'Paramètres' : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            } text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50`}
          >
            <Settings size={18} className="shrink-0" />
            {!collapsed && <span>Paramètres</span>}
          </button>
        </nav>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
          title={collapsed ? 'Développer le menu' : 'Réduire le menu'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Réduire</span>}
        </button>
      </div>
    </aside>
  )
}
