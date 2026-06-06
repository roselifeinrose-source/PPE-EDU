import { useState } from 'react'
import { Plus, BookOpen, Puzzle, ListOrdered, Brain, ArrowDownFromLine, AlertTriangle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import useGameStore from '../../store/useGameStore'
import { generateGameFromText } from '../../utils/aiService'
import ImageQuizGenerator from '../../components/ImageQuizGenerator'
import QuizWizard from '../../components/QuizWizard'
import TemplatePicker from '../../components/TemplatePicker'
import GenerationModal from '../../components/GenerationModal'

const GAME_TYPES = [
  { value: 'quiz', label: 'Quiz à choix multiples', icon: BookOpen, desc: 'Questions à 4 choix', color: 'purple' },
  { value: 'puzzle', label: "Puzzle d'association", icon: Puzzle, desc: 'Associer concepts et définitions', color: 'blue' },
  { value: 'sequencing', label: 'Séquencement', icon: ListOrdered, desc: 'Remettre les étapes en ordre', color: 'teal' },
  { value: 'memory', label: 'Memory', icon: Brain, desc: 'Associer les cartes identiques', color: 'amber' },
  { value: 'cloze', label: 'Texte à trous', icon: BookOpen, desc: 'Remplir les mots manquants', color: 'green' },
  { value: 'dropping', label: 'Tri par chute', icon: ArrowDownFromLine, desc: 'Trier les objets en les faisant tomber', color: 'orange' },
]

const TYPE_COLORS = {
  purple: 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/30',
  blue: 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30',
  teal: 'border-teal-300 dark:border-teal-600 bg-teal-50 dark:bg-teal-900/30',
  amber: 'border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/30',
  green: 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30',
  orange: 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/30',
}

export default function TeacherCreatePage() {
  const addGame = useGameStore((s) => s.addGame)
  const [step, setStep] = useState(1)
  const [lessonText, setLessonText] = useState('')
  const [gameType, setGameType] = useState('quiz')
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(null)
  const [genError, setGenError] = useState(null)
  const [genSimulation, setGenSimulation] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [created, setCreated] = useState(false)

  const isApiKeyMissing = import.meta.env.VITE_GEMINI_API_KEY === undefined || import.meta.env.VITE_GEMINI_API_KEY.trim() === ''

  const handleGenerate = async () => {
    if (!lessonText.trim()) return
    setGenerating(true)
    setGenProgress('analyzing')
    setGenError(null)
    setGenSimulation(false)
    try {
      const result = await generateGameFromText(lessonText, gameType, (step) => setGenProgress(step))
      addGame(result.game)
      setGenSimulation(result.isSimulation)
      setCreated(true)
    } catch (err) {
      setGenError(err.message || 'Une erreur est survenue.')
    } finally {
      setGenerating(false)
      setTimeout(() => { setGenProgress(null); setGenError(null) }, 2500)
    }
  }

  const resetWizard = () => {
    setStep(1)
    setLessonText('')
    setGameType('quiz')
    setCreated(false)
    setGenSimulation(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Créer un Jeu</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowWizard(true)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-medium transition-all">
            <Sparkles size={14} /> Wizard
          </button>
          <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg text-xs font-medium transition-all">
            <Plus size={14} /> Modèles
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>{s}</div>
            <span className={`text-sm font-medium ${step >= s ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
              {s === 1 ? 'Coller la leçon' : s === 2 ? 'Choisir le type' : 'Générer'}
            </span>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      {isApiKeyMissing && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Clé API manquante.</strong> Les jeux seront générés en mode simulation.
            Créez un fichier <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> avec <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">VITE_GEMINI_API_KEY=votre_clé</code>.
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Étape 1 : Coller la leçon</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Collez le contenu de votre leçon ou cours. L'IA analysera le texte pour générer des questions pertinentes.</p>
            <textarea
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              rows={8}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Coller la leçon ici..."
            />
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ou générer depuis une image :</p>
              <ImageQuizGenerator
                onGenerated={(quiz) => {
                  const game = { id: 'g' + Date.now(), createdAt: new Date().toISOString(), subject: 'Informatique', title: quiz.title || 'Quiz depuis image', topic: quiz.topic || 'Image', gameType: 'quiz', content: { questions: quiz.questions }, analytics: { attempts: 0, averageScore: 0, failedConcepts: [] } }
                  addGame(game)
                  setCreated(true)
                  setStep(3)
                }}
              />
            </div>
            <div className="flex justify-end">
              <button onClick={() => lessonText.trim() && setStep(2)} disabled={!lessonText.trim()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all">
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Étape 2 : Choisir le type de jeu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {GAME_TYPES.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.value}
                    onClick={() => setGameType(opt.value)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                      gameType === opt.value
                        ? TYPE_COLORS[opt.color]
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon size={20} className={gameType === opt.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
                    <div>
                      <div className={`text-sm font-medium ${gameType === opt.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{opt.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2.5 text-sm transition-all">
                <ChevronLeft size={16} /> Retour
              </button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all">
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Étape 3 : Générer</h2>
            {created ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Jeu créé avec succès !</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Retournez dans « Mes Jeux » pour le voir et le jouer.</p>
                <button onClick={resetWizard} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all">
                  Créer un autre jeu
                </button>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300">
                  <p><strong>Type :</strong> {GAME_TYPES.find((t) => t.value === gameType)?.label}</p>
                  <p className="mt-1"><strong>Longueur du texte :</strong> {lessonText.split(/\s+/).filter(Boolean).length} mots</p>
                </div>
                {genSimulation && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-slate-700 dark:text-slate-300"><strong>Mode simulation.</strong> Données fictives générées (API indisponible).</div>
                  </div>
                )}
                {genError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">{genError}</div>
                )}
                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2.5 text-sm transition-all">
                    <ChevronLeft size={16} /> Retour
                  </button>
                  <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all">
                    {generating ? 'Génération en cours...' : 'Générer le jeu'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <GenerationModal open={generating || genProgress === 'done'} progress={genProgress} error={genError} onClose={() => { setGenProgress(null); setGenError(null) }} />
      <QuizWizard open={showWizard} onClose={() => setShowWizard(false)} onGenerate={async (text, type, title, topic, difficulty, preGenerated) => { if (preGenerated) { addGame(preGenerated); return preGenerated } const result = await generateGameFromText(text, type, (step) => setGenProgress(step)); const game = { ...result.game, title: title || result.game.title, topic: topic || result.game.topic }; addGame(game); return result }} />
      <TemplatePicker open={showTemplates} onClose={() => setShowTemplates(false)} onSelect={(tpl) => { const game = { id: 'g' + Date.now(), createdAt: new Date().toISOString(), subject: 'Informatique', title: tpl.title, topic: tpl.topic, gameType: tpl.gameType, content: JSON.parse(JSON.stringify(tpl.gameType === 'quiz' ? { questions: tpl.questions } : tpl.gameType === 'puzzle' || tpl.gameType === 'memory' ? { pairs: tpl.pairs } : tpl.gameType === 'cloze' ? { text: tpl.text, blanks: tpl.blanks } : tpl.gameType === 'dropping' ? { items: tpl.items, categories: tpl.categories } : { steps: tpl.steps })), analytics: { attempts: 0, averageScore: 0, failedConcepts: [] } }; addGame(game) }} />
    </div>
  )
}
