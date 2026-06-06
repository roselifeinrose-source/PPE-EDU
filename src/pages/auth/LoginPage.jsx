import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, BookOpen, User } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

export default function LoginPage() {
  const [loginRole, setLoginRole] = useState(null)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [studentName, setStudentName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { loginTeacher, signup, loginStudentByName } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (loginRole === 'student') {
        await loginStudentByName(studentName)
        navigate('/dashboard')
      } else {
        if (mode === 'login') {
          await loginTeacher(email, password)
        } else {
          await signup({ name, email, password })
        }
        navigate('/teacher/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!loginRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">InforGames</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Plateforme d'apprentissage interactive</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-6">Qui êtes-vous ?</h2>
            <div className="space-y-3">
              <button
                onClick={() => { setLoginRole('teacher'); setError('') }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40 transition-colors">
                  <BookOpen size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">Enseignant</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gérer les classes et les jeux</p>
                </div>
              </button>

              <button
                onClick={() => { setLoginRole('student'); setError('') }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                  <GraduationCap size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">Élève</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Jouer et apprendre</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">InforGames</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Plateforme d'apprentissage interactive</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <button
            onClick={() => { setLoginRole(null); setError(''); setEmail(''); setPassword(''); setName(''); setStudentName('') }}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 flex items-center gap-1 transition-colors"
          >
            &larr; Retour
          </button>

          {loginRole === 'teacher' && (
            <>
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
                <button
                  onClick={() => { setMode('login'); setError('') }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  <LogIn size={14} className="inline mr-1.5" />
                  Connexion
                </button>
                <button
                  onClick={() => { setMode('signup'); setError('') }}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${mode === 'signup' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  <UserPlus size={14} className="inline mr-1.5" />
                  Inscription
                </button>
              </div>
            </>
          )}

          {loginRole === 'student' && (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white text-center mb-6">
              Connexion Élève
            </h2>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginRole === 'teacher' && mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="M. Alami"
                />
              </div>
            )}

            {loginRole === 'teacher' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="admin@school.ma"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mot de passe</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {loginRole === 'student' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom d'utilisateur</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Entrez votre nom"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {loginRole === 'student' ? <GraduationCap size={16} /> : (mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />)}
                  {loginRole === 'student' ? 'Se connecter' : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
                </>
              )}
            </button>
          </form>

          {loginRole === 'teacher' && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Compte démo: <span className="font-mono">admin@school.ma</span> / <span className="font-mono">admin123</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
