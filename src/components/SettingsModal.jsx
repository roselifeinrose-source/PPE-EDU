import { useState, useEffect } from 'react'
import { X, Moon, Sun, UserPlus, Trash2, Palette, Gamepad2, Brain } from 'lucide-react'
import useSettingsStore from '../store/useSettingsStore'
import useGameStore from '../store/useGameStore'
import useProviderStore from '../store/useProviderStore'
import useAuthStore from '../store/useAuthStore'
import { getLevel } from '../constants'

const ACCENT_COLORS = [
  { id: 'indigo', value: '#6366f1', label: 'Indigo' },
  { id: 'emerald', value: '#10b981', label: 'Émeraude' },
  { id: 'amber', value: '#f59e0b', label: 'Ambre' },
  { id: 'rose', value: '#f43f5e', label: 'Rose' },
  { id: 'cyan', value: '#06b6d4', label: 'Cyan' },
  { id: 'purple', value: '#8b5cf6', label: 'Violet' },
]

const GAME_THEMES = [
  { id: 'default', label: 'Par défaut', preview: 'from-indigo-500 to-violet-600', emoji: '🎮' },
  { id: 'space', label: 'Espace', preview: 'from-slate-900 via-indigo-950 to-purple-950', emoji: '🚀' },
  { id: 'forest', label: 'Forêt', preview: 'from-emerald-800 via-green-700 to-teal-800', emoji: '🌲' },
  { id: 'ocean', label: 'Océan', preview: 'from-blue-800 via-cyan-700 to-teal-600', emoji: '🌊' },
  { id: 'cyberpunk', label: 'Cyberpunk', preview: 'from-pink-600 via-purple-600 to-cyan-500', emoji: '🤖' },
]

export default function SettingsModal({ open, onClose }) {
  const { theme, setTheme, accentColor, setAccentColor, gameTheme, setGameTheme } = useSettingsStore()
  const { provider, geminiApiKey, geminiModel, geminiModels, opencodeBaseUrl, opencodeModel, opencodePassword, setProvider, setGeminiApiKey, setGeminiModel, setOpencodeBaseUrl, setOpencodeModel, setOpencodePassword } = useProviderStore()
  const students = useGameStore((s) => s.students)
  const role = useAuthStore((s) => s.role)
  const [activeTab, setActiveTab] = useState('theme')
  const [newName, setNewName] = useState('')
  const addStudent = useGameStore((s) => s.addStudent)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const tabs = [
    { id: 'theme', label: 'Thème', icon: Moon },
    { id: 'students', label: 'Élèves', icon: UserPlus },
    { id: 'accent', label: "Couleur d'accent", icon: Palette },
    { id: 'gametheme', label: 'Thème Jeu', icon: Gamepad2 },
    ...(role === 'teacher' ? [{ id: 'ai', label: 'IA', icon: Brain }] : []),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Paramètres">
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Paramètres</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 flex-1 px-3 py-2.5 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'theme' && (
            <>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Thème</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <Moon size={18} /> Sombre
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border text-sm transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  <Sun size={18} /> Clair
                </button>
              </div>
            </>
          )}

          {activeTab === 'accent' && (
            <>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Couleur d'accent</label>
              <div className="grid grid-cols-3 gap-3">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs transition-all duration-200 ${
                      accentColor === color.value
                        ? 'border-2 border-slate-900 dark:border-slate-100'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color.value }} />
                    <span className="text-slate-700 dark:text-slate-300">{color.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === 'gametheme' && (
            <>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Thème visuel des jeux</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choisissez unskin visuel pour vos sessions de jeu.</p>
              <div className="grid grid-cols-2 gap-3">
                {GAME_THEMES.map((gt) => (
                  <button
                    key={gt.id}
                    onClick={() => setGameTheme(gt.id)}
                    className={`relative overflow-hidden rounded-xl border text-left transition-all duration-200 ${
                      gameTheme === gt.id
                        ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className={`h-16 bg-gradient-to-r ${gt.preview}`} />
                    <div className="px-3 py-2.5 flex items-center gap-2">
                      <span className="text-lg">{gt.emoji}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{gt.label}</span>
                      {gameTheme === gt.id && <span className="ml-auto text-indigo-600 dark:text-indigo-400 text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">Fournisseur IA</label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choisissez le moteur utilisé pour la génération de contenu et le chat.</p>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setProvider('gemini')}
                  className={`flex-1 flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${
                    provider === 'gemini'
                      ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-lg">🧠</span>
                  <span className="text-slate-900 dark:text-slate-100">Gemini</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Google</span>
                  {provider === 'gemini' && <span className="text-indigo-600 dark:text-indigo-400 text-xs">✓</span>}
                </button>
                <button
                  onClick={() => setProvider('opencode')}
                  className={`flex-1 flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all duration-200 ${
                    provider === 'opencode'
                      ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-lg">⚡</span>
                  <span className="text-slate-900 dark:text-slate-100">Opencode</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Local</span>
                  {provider === 'opencode' && <span className="text-indigo-600 dark:text-indigo-400 text-xs">✓</span>}
                </button>
              </div>

              {provider === 'gemini' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Clé API Gemini</label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Saisissez votre clé API..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Laissé vide pour utiliser la variable d&apos;environnement <code className="text-indigo-500 text-[10px]">VITE_GEMINI_API_KEY</code>
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Modèle</label>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      {geminiModels.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {provider === 'opencode' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">URL du serveur Opencode</label>
                    <input
                      type="text"
                      value={opencodeBaseUrl}
                      onChange={(e) => setOpencodeBaseUrl(e.target.value)}
                      placeholder="http://localhost:4096"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Laissez <code className="text-indigo-500 text-[10px]">http://localhost:4096</code> par défaut.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Modèle (optionnel)</label>
                    <input
                      type="text"
                      value={opencodeModel}
                      onChange={(e) => setOpencodeModel(e.target.value)}
                      placeholder="Ex: anthropic/claude-sonnet-4-20250514"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Laissé vide pour utiliser le modèle par défaut du serveur.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mot de passe serveur</label>
                    <input
                      type="password"
                      value={opencodePassword}
                      onChange={(e) => setOpencodePassword(e.target.value)}
                      placeholder="OPENCODE_SERVER_PASSWORD"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Requis si le serveur est protégé (variable <code className="text-indigo-500 text-[10px]">OPENCODE_SERVER_PASSWORD</code>).
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'students' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Élèves</label>
                <span className="text-xs text-slate-500 dark:text-slate-400">{students.length} élève{students.length > 1 ? 's' : ''}</span>
              </div>

              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{s.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Niveau {getLevel(s.totalXP)} · {s.totalXP} XP</div>
                    </div>
                    <button
                      onClick={() => {
                        const name = s.name
                        if (window.confirm(`Supprimer l'élève "${name}" ? Cette action est irréversible.`)) {
                          useGameStore.setState((state) => ({
                            students: state.students.filter((st) => st.id !== s.id),
                          }))
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shrink-0 ml-2"
                      aria-label={`Supprimer ${s.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newName.trim()) {
                      addStudent({ name: newName.trim() })
                      setNewName('')
                    }
                  }}
                  placeholder="Nom de l'élève"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  aria-label="Nom de l'élève"
                />
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      addStudent({ name: newName.trim() })
                      setNewName('')
                    }
                  }}
                  disabled={!newName.trim()}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  <UserPlus size={14} /> Ajouter
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
