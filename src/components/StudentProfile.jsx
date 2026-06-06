import { useState } from 'react'
import { Star, Trophy, BookOpen, TrendingUp, User, Download } from 'lucide-react'
import useGameStore, { getRewardTier } from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import AchievementSystem from './AchievementSystem'
import ProgressHistory from './ProgressHistory'
import { XP_PER_LEVEL } from '../constants'

function exportStudentCSV(student, games) {
  const rows = [
    ['Jeu', 'Type', 'Score (%)', 'XP gagnés', 'Date'],
    ...student.completedGames.map((cg) => {
      const game = games.find((g) => g.id === cg.gameId)
      return [
        game?.title || cg.gameId,
        game?.gameType || '',
        cg.score,
        cg.xpGained,
        new Date(cg.date).toLocaleDateString('fr-FR'),
      ]
    }),
  ]
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `progression_${student.name.replace(/\s+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const ACCESSORIES = {
  none: { label: 'Aucun', emoji: '', minLevel: 1 },
  glasses: { label: 'Lunettes 🕶️', emoji: '🕶️', minLevel: 2 },
  headset: { label: 'Casque 🎧', emoji: '🎧', minLevel: 3 },
  crown: { label: 'Couronne 👑', emoji: '👑', minLevel: 5 },
  wizard: { label: 'Chapeau 🧙', emoji: '🧙', minLevel: 8 },
  halo: { label: 'Auréole 😇', emoji: '😇', minLevel: 10 },
}

const EMOJIS = ['👤', '🐱', '🦊', '🐼', '🦁', '🤖', '👽', '🦄', '🐵', '🐯', '🐸', '🐙', '🐧', '🦉', '🐹', '🦖']

const GRADIENTS = [
  { name: 'Indigo', class: 'from-indigo-500 to-purple-500' },
  { name: 'Émeraude', class: 'from-emerald-400 to-teal-600' },
  { name: 'Rose', class: 'from-pink-500 to-rose-500' },
  { name: 'Ambre', class: 'from-amber-400 to-orange-500' },
  { name: 'Violet', class: 'from-violet-500 to-fuchsia-500' },
  { name: 'Cyan', class: 'from-cyan-400 to-blue-600' },
]

export default function StudentProfile() {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const games = useGameStore((s) => s.games)
  const updateStudentAvatar = useGameStore((s) => s.updateStudentAvatar)
  const [activeTab, setActiveTab] = useState('overview')
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [tempAvatar, setTempAvatar] = useState({ emoji: '👤', color: 'from-slate-400 to-slate-600', accessory: 'none' })

  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)
  if (!student) return <p className="text-slate-500 dark:text-slate-400 text-sm">Sélectionnez un élève dans la barre de navigation.</p>

  const currentAvatar = student.avatar || { emoji: '👤', color: 'from-slate-400 to-slate-600', accessory: 'none' }

  const xpProgress = ((student.totalXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100
  const tier = getRewardTier(student.totalXP)
  const completedCount = student.completedGames.length
  const avgScore = completedCount > 0 ? Math.round(student.completedGames.reduce((sum, cg) => sum + cg.score, 0) / completedCount) : 0
  const perfectScores = student.completedGames.filter((cg) => cg.score === 100).length
  const unlockedAchievements = (student.achievements || []).length

  const openAvatarModal = () => {
    setTempAvatar(currentAvatar)
    setAvatarModalOpen(true)
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: User },
    { id: 'history', label: 'Historique', icon: TrendingUp },
    { id: 'achievements', label: `Achievements (${unlockedAchievements})`, icon: Trophy },
  ]

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={openAvatarModal}
              title="Modifier l'avatar"
              className={`group relative w-16 h-16 rounded-2xl bg-gradient-to-br ${currentAvatar.color} border border-white/30 flex items-center justify-center text-3xl shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 shrink-0`}
            >
              <span>{currentAvatar.emoji}</span>
              {currentAvatar.accessory !== 'none' && ACCESSORIES[currentAvatar.accessory] && (
                <span className="absolute -top-1.5 -right-1.5 text-base bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full w-6 h-6 flex items-center justify-center shadow-sm z-10">
                  {ACCESSORIES[currentAvatar.accessory].emoji}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-opacity duration-200 z-20">
                Modifier
              </div>
            </button>
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-white/80">Niveau {student.level}</span>
                <span className="text-white/50">·</span>
                <span className="text-sm font-semibold">{tier.icon} {tier.label}</span>
                {student.dailyStreak > 0 && (
                  <span className="text-sm">🔥 {student.dailyStreak} jour{student.dailyStreak > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => exportStudentCSV(student, games)}
            title="Exporter en CSV"
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
          >
            <Download size={16} />
          </button>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/70 mb-1.5">
            <span>{student.totalXP % XP_PER_LEVEL} / {XP_PER_LEVEL} XP vers le niveau {student.level + 1}</span>
            <span className="font-bold text-white">{student.totalXP} XP total</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700 shadow-sm" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Parties jouées', value: completedCount, icon: BookOpen, color: 'indigo' },
          { label: 'Score moyen', value: `${avgScore}%`, icon: TrendingUp, color: 'emerald' },
          { label: 'Scores parfaits', value: perfectScores, icon: Star, color: 'amber' },
          { label: 'Achievements', value: unlockedAchievements, icon: Trophy, color: 'violet' },
        ].map((stat) => {
          const Icon = stat.icon
          const colorMap = {
            indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
            emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
            amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
            violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
          }
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorMap[stat.color]}`}>
                <Icon size={15} />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Recent games */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Parties récentes</h3>
            {completedCount === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Aucune partie pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                {[...student.completedGames].reverse().slice(0, 5).map((cg, i) => {
                  const game = games.find((g) => g.id === cg.gameId)
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{game?.title || cg.gameId}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(cg.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${cg.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : cg.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                          {cg.score}%
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">+{cg.xpGained} XP</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Reward tier */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" /> Palier de récompense
            </h3>
            <div className="flex gap-3">
              {[
                { tier: 'bronze', label: 'Bronze', icon: '🥉', xp: 0 },
                { tier: 'argent', label: 'Argent', icon: '🥈', xp: 500 },
                { tier: 'or', label: 'Or', icon: '🥇', xp: 1500 },
                { tier: 'diamant', label: 'Diamant', icon: '💎', xp: 3000 },
              ].map((t) => {
                const current = t.tier === tier.tier
                const achieved = student.totalXP >= t.xp
                return (
                  <div key={t.tier} className={`flex-1 text-center p-2.5 rounded-xl border transition-all duration-200 ${current ? 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20' : achieved ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 opacity-60' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 opacity-30'}`}>
                    <div className="text-xl mb-1">{t.icon}</div>
                    <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{t.label}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500">{t.xp} XP</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && <ProgressHistory />}
      {activeTab === 'achievements' && <AchievementSystem />}

      {avatarModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setAvatarModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Personnalisation de l'avatar"
        >
          <div 
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Personnaliser votre Avatar</h2>
                <button 
                  onClick={() => setAvatarModalOpen(false)}
                  className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/60 mb-6">
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${tempAvatar.color} flex items-center justify-center text-4xl shadow-md border-2 border-white dark:border-slate-800 transition-all duration-300`}>
                  <span>{tempAvatar.emoji}</span>
                  {tempAvatar.accessory !== 'none' && ACCESSORIES[tempAvatar.accessory] && (
                    <span className="absolute -top-2.5 -right-2.5 text-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md animate-bounce z-10">
                      {ACCESSORIES[tempAvatar.accessory].emoji}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">Aperçu en direct</span>
              </div>

              {/* Options */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {/* Emojis list */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">1. Choisir un personnage</label>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJIS.map((em) => (
                      <button
                        key={em}
                        onClick={() => setTempAvatar((prev) => ({ ...prev, emoji: em }))}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border text-lg transition-all duration-150 hover:scale-105 active:scale-95 ${
                          tempAvatar.emoji === em 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gradients list */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">2. Choisir un fond</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADIENTS.map((g) => (
                      <button
                        key={g.class}
                        onClick={() => setTempAvatar((prev) => ({ ...prev, color: g.class }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-150 ${
                          tempAvatar.color === g.class 
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded bg-gradient-to-br ${g.class}`} />
                        <span className="text-slate-700 dark:text-slate-300">{g.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessories list */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">3. Choisir un accessoire (Niveaux débloqués)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ACCESSORIES).map(([key, acc]) => {
                      const unlocked = student.level >= acc.minLevel
                      const isSelected = tempAvatar.accessory === key
                      return (
                        <button
                          key={key}
                          disabled={!unlocked}
                          onClick={() => setTempAvatar((prev) => ({ ...prev, accessory: key }))}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                            !unlocked 
                              ? 'opacity-40 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-850 cursor-not-allowed'
                              : isSelected
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{acc.label}</span>
                          </div>
                          {!unlocked ? (
                            <span className="text-[10px] text-slate-400 font-normal">Niv. {acc.minLevel} 🔒</span>
                          ) : (
                            isSelected && <span className="text-indigo-600">✓</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  onClick={() => setAvatarModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-150"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    updateStudentAvatar(student.id, tempAvatar)
                    setAvatarModalOpen(false)
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
