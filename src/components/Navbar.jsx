import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, User, Sword, Zap, BookOpen, Settings, Sun, Moon, Menu, X, MessageCircle } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import useGameStore from '../store/useGameStore'
import useTheme from '../hooks/useTheme'
import SettingsModal from './SettingsModal'
import { XP_PER_LEVEL } from '../constants'

export default function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { role, currentStudentId, setTeacherView, setStudentView } = useAuthStore()
  const students = useGameStore((s) => s.students)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const currentStudent = students.find((s) => s.id === currentStudentId)
  const xpProgress = currentStudent ? ((currentStudent.totalXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 : 0

  const handleToggle = () => {
    if (role === 'teacher') {
      setStudentView(students[0]?.id)
    } else {
      setTeacherView()
    }
    navigate('/')
  }

  const switchStudent = (id) => setStudentView(id)

  const navLinks = role === 'teacher'
    ? [
        { label: 'Tableau de Bord', path: '/teacher', icon: BookOpen },
        { label: 'Analytiques', path: '/teacher/analytics', icon: Settings },
        { label: 'Assistant', path: '/chat', icon: MessageCircle },
      ]
    : [
        { label: 'Missions', path: '/dashboard', icon: Sword },
        { label: 'Classement', path: '/leaderboard', icon: Zap },
        { label: 'Assistant', path: '/chat', icon: MessageCircle },
      ]

  return (
    <>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/')} className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                <GraduationCap size={24} />
                <span>InforGames</span>
              </button>

              <nav className="hidden sm:flex items-center gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => { navigate(link.path); setMobileOpen(false) }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === link.path
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {role === 'student' && currentStudent && (
                <div className="hidden sm:flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-1.5">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{currentStudent.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Niveau {currentStudent.level}</div>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-200" style={{ width: `${xpProgress}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right mt-0.5">{currentStudent.totalXP % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</div>
                  </div>
                  {students.length > 1 && (
                    <select
                      value={currentStudentId}
                      onChange={(e) => switchStudent(e.target.value)}
                      className="bg-transparent text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-lg px-1.5 py-1 cursor-pointer focus:outline-none"
                    >
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {role === 'teacher' && (
                <div className="hidden sm:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                  <User size={16} />
                  <span>Vue Enseignant</span>
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
                title="Changer le thème"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <Settings size={18} />
              </button>

              <button
                onClick={handleToggle}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                {role === 'teacher' ? 'Passer en Élève' : 'Passer en Enseignant'}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="sm:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </button>
            ))}
            {role === 'student' && currentStudent && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{currentStudent.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Niveau {currentStudent.level} &middot; {currentStudent.totalXP} XP</div>
              </div>
            )}
            <button onClick={handleToggle} className="w-full text-left text-sm text-indigo-600 dark:text-indigo-400 font-medium py-1">
              {role === 'teacher' ? 'Passer en Vue Élève' : 'Passer en Vue Enseignant'}
            </button>
          </div>
        )}
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
