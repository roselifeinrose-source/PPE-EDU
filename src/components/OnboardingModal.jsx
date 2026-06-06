import { useState } from 'react'
import { X, ChevronRight, Zap } from 'lucide-react'

const STEPS = [
  {
    icon: '🎮',
    title: 'Bienvenue sur InforGames !',
    desc: 'La plateforme d\'apprentissage ludique pour l\'informatique. Jouez, progressez et devenez un expert !',
    detail: 'Chaque défi complété vous rapporte des XP et fait monter votre niveau.',
  },
  {
    icon: '⚡',
    title: 'Le système XP & Niveaux',
    desc: 'Gagnez des XP en complétant des jeux. Plus votre score est élevé, plus vous gagnez d\'XP !',
    detail: '300 XP = 1 niveau. Atteignez le niveau 10 pour devenir Expert !',
  },
  {
    icon: '🏆',
    title: 'Les Achievements',
    desc: 'Débloquez des achievements en accomplissant des exploits : score parfait, 5 parties, niveau 5...',
    detail: 'Chaque achievement est un témoignage de votre progression !',
  },
  {
    icon: '📅',
    title: 'Le Défi Quotidien',
    desc: 'Chaque jour, un nouveau défi express vous attend ! Répondez à 5 questions en moins de 60 secondes.',
    detail: 'Jouez chaque jour pour augmenter votre streak et débloquer des bonus !',
  },
  {
    icon: '⚔️',
    title: 'Les Défis entre élèves',
    desc: 'Défiez vos camarades sur un jeu ! Comparez vos scores directement.',
    detail: 'Le défi reste actif 24h. Le meilleur score l\'emporte !',
  },
]

export default function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleDone()
    }
  }

  const handleDone = () => {
    setVisible(false)
    setTimeout(onDone, 300)
  }

  if (!visible) return null

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Progress bar */}
        <div className="h-1 bg-slate-200 dark:bg-slate-700">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Skip */}
        <div className="flex justify-end px-5 pt-4">
          <button onClick={handleDone} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-all duration-200">
            <X size={12} /> Passer
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 text-center">
          <div className="text-6xl mb-4 animate-bounce">{current.icon}</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{current.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{current.desc}</p>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl px-4 py-3">
            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">{current.detail}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 pb-6">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${i === step ? 'bg-indigo-500 w-4' : i < step ? 'bg-indigo-300 dark:bg-indigo-700' : 'bg-slate-200 dark:bg-slate-700'}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {step < STEPS.length - 1 ? (
              <>Suivant <ChevronRight size={16} /></>
            ) : (
              <>Commencer ! <Zap size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
