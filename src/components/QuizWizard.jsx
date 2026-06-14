import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, FileText, Brain, Puzzle, ListOrdered, Upload, Sparkles, Check, AlertTriangle, BookOpen, ArrowDownFromLine } from 'lucide-react'

const gameTypeOptions = [
  { value: 'quiz', label: 'Quiz', icon: FileText, desc: 'Questions à 4 choix' },
  { value: 'puzzle', label: 'Puzzle', icon: Puzzle, desc: 'Association concepts/définitions' },
  { value: 'sequencing', label: 'Séquencement', icon: ListOrdered, desc: 'Ordre chronologique' },
  { value: 'memory', label: 'Memory', icon: Brain, desc: 'Associer les cartes identiques' },
  { value: 'cloze', label: 'Texte à trous', icon: BookOpen, desc: 'Remplir les mots manquants' },
  { value: 'dropping', label: 'Tri par chute', icon: ArrowDownFromLine, desc: 'Trier les objets en les faisant tomber' },
]

const difficultyOptions = [
  { value: 'easy', label: 'Facile', desc: '3-4 questions, concepts simples', color: 'emerald' },
  { value: 'medium', label: 'Moyen', desc: '5 questions, concepts intermédiaires', color: 'amber' },
  { value: 'hard', label: 'Difficile', desc: '6-8 questions, concepts avancés', color: 'red' },
]

const STEP_LABELS = ['Type & Titre', 'Contenu', 'Aperçu', 'Récapitulatif']

export default function QuizWizard({ open, onClose, onGenerate }) {
  const [step, setStep] = useState(0)
  const [gameType, setGameType] = useState('quiz')
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [lessonText, setLessonText] = useState('')
  const [fileName, setFileName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [previewGame, setPreviewGame] = useState(null)
  const [genError, setGenError] = useState(null)
  const [openEndedFlags, setOpenEndedFlags] = useState({}) // questionId -> bool
  const [hintTexts, setHintTexts] = useState({}) // questionId -> string

  if (!open) return null

  const canNext = () => {
    if (step === 0) return gameType && title.trim()
    if (step === 1) return lessonText.trim().length > 10
    if (step === 2) return previewGame !== null
    return true
  }

  const handleFileImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') setLessonText(text)
    }
    reader.readAsText(file)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenError(null)
    try {
      const result = await onGenerate(lessonText, gameType, title, topic, difficulty)
      setPreviewGame(result.game)
      setStep(2)
    } catch (err) {
      setGenError(err.message || 'Erreur lors de la génération.')
    } finally {
      setGenerating(false)
    }
  }

  const handleConfirm = () => {
    if (previewGame) {
      // Merge open-ended flags + hints into questions if quiz type
      let finalGame = previewGame
      if (previewGame.gameType === 'quiz' && previewGame.content?.questions) {
        const questions = previewGame.content.questions.map((q) => ({
          ...q,
          ...(openEndedFlags[q.id] ? { openEnded: true, hint: hintTexts[q.id] || '', options: undefined, correctIndex: undefined } : {}),
        }))
        finalGame = { ...previewGame, content: { ...previewGame.content, questions } }
      }
      onGenerate(null, null, null, null, null, finalGame)
    }
    onClose()
    resetWizard()
  }

  const resetWizard = () => {
    setStep(0)
    setGameType('quiz')
    setTitle('')
    setTopic('')
    setDifficulty('medium')
    setLessonText('')
    setFileName('')
    setPreviewGame(null)
    setGenError(null)
    setOpenEndedFlags({})
    setHintTexts({})
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Créer un jeu éducatif</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4 shrink-0">
          <div className="flex items-center gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200 ${
                    i < step ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : i === step ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-300 dark:ring-indigo-700'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  }`}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:inline ${i <= step ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded ${i < step ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Type de jeu</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gameTypeOptions.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button key={opt.value} onClick={() => setGameType(opt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all duration-200 ${
                          gameType === opt.value
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                        }`}>
                        <Icon size={22} className={gameType === opt.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                        <div>
                          <div className={`text-sm font-medium ${gameType === opt.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Titre du jeu</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Quiz sur les composants de l'ordinateur"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Sujet / Thème</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Architecture, Algorithmique, Réseaux..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Difficulté</label>
                <div className="grid grid-cols-3 gap-3">
                  {difficultyOptions.map((opt) => (
                    <button key={opt.value} onClick={() => setDifficulty(opt.value)}
                      className={`p-3 rounded-lg border text-center transition-all duration-200 ${
                        difficulty === opt.value
                          ? `bg-${opt.color}-50 dark:bg-${opt.color}-900/20 border-${opt.color}-300 dark:border-${opt.color}-600`
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}>
                      <div className={`text-sm font-medium ${difficulty === opt.value ? `text-${opt.color}-700 dark:text-${opt.color}-300` : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Contenu du cours</label>
                <label className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition-all duration-200">
                  <Upload size={14} /> Importer un fichier
                  <input type="file" accept=".txt,.md,.csv" onChange={handleFileImport} className="hidden" />
                </label>
              </div>
              {fileName && (
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText size={12} /> {fileName}
                  <button onClick={() => { setFileName(''); setLessonText('') }} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                </div>
              )}
              <textarea value={lessonText} onChange={(e) => setLessonText(e.target.value)} rows={10}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
                placeholder="Collez le texte du cours ici, ou importez un fichier .txt..." />
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>{lessonText.length} caractères</span>
                {lessonText.length > 0 && lessonText.length < 20 && <span className="text-amber-500">Minimum ~20 caractères pour générer</span>}
              </div>

              {genError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-600 dark:text-red-400">{genError}</span>
                </div>
              )}

              <button onClick={handleGenerate} disabled={generating || !lessonText.trim() || lessonText.length < 20}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">
                {generating ? (
                  <><span className="animate-spin">⏳</span> Génération en cours...</>
                ) : (
                  <><Sparkles size={16} /> Générer avec l'IA</>
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {!previewGame && !generating && (
                <div className="text-center py-8">
                  <Brain size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Retour à l'étape 2 pour générer le contenu.</p>
                </div>
              )}
              {generating && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={24} className="text-indigo-500 animate-pulse" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Génération en cours...</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">L'IA analyse votre contenu</p>
                </div>
              )}
              {previewGame && !generating && (
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{previewGame.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{previewGame.topic}</span>
                      <span>·</span>
                      <span>{gameType === 'quiz' ? `${previewGame.content.questions?.length || 0} questions` : gameType === 'puzzle' || gameType === 'memory' ? `${previewGame.content.pairs?.length || 0} paires` : gameType === 'cloze' ? `${Object.keys(previewGame.content.blanks || {}).length} trous` : gameType === 'dropping' ? `${previewGame.content.items?.length || 0} éléments → ${previewGame.content.categories?.length || 0} catégories` : `${previewGame.content.steps?.length || 0} étapes`}</span>
                    </div>
                  </div>

                  {gameType === 'quiz' && previewGame.content.questions?.map((q, i) => (
                    <div key={q.id} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="text-xs font-medium text-slate-900 dark:text-slate-100">Q{i + 1}: {q.question}</div>
                        <button
                          onClick={() => setOpenEndedFlags((f) => ({ ...f, [q.id]: !f[q.id] }))}
                          title={openEndedFlags[q.id] ? 'Basculer en QCM' : 'Rendre ouverte'}
                          className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all duration-200 ${
                            openEndedFlags[q.id]
                              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 hover:border-amber-300'
                          }`}
                        >
                          {openEndedFlags[q.id] ? '✏️ Ouverte' : 'QCM'}
                        </button>
                      </div>
                      {openEndedFlags[q.id] ? (
                        <input
                          type="text"
                          value={hintTexts[q.id] || ''}
                          onChange={(e) => setHintTexts((h) => ({ ...h, [q.id]: e.target.value }))}
                          placeholder="Réponse attendue (indice pour l'enseignant)..."
                          className="w-full mt-1 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 rounded px-2 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-400"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-[11px] px-2 py-1 rounded ${oi === q.correctIndex ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                              {String.fromCharCode(65 + oi)}. {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {gameType === 'puzzle' && previewGame.content.pairs?.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 flex-1">{p.left}</span>
                      <span className="text-slate-400">←→</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{p.right}</span>
                    </div>
                  ))}

                  {gameType === 'memory' && previewGame.content.pairs?.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 flex-1">🧠 {p.left}</span>
                      <span className="text-slate-400">↔</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{p.right}</span>
                    </div>
                  ))}

                  {gameType === 'cloze' && previewGame.content && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {(previewGame.content.text || '').split(/(\[blank\d+\])/g).map((seg, i) => {
                          const match = seg.match(/^\[(blank\d+)\]$/)
                          if (match) {
                            const blankData = previewGame.content.blanks?.[match[1]]
                            return (
                              <span key={i} className="inline-flex items-center mx-1 px-2 py-0.5 rounded border-2 border-dashed border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium text-[11px]">
                                {blankData?.correct || match[1]}
                              </span>
                            )
                          }
                          return <span key={i}>{seg}</span>
                        })}
                      </p>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {Object.keys(previewGame.content.blanks || {}).length} trou{Object.keys(previewGame.content.blanks || {}).length > 1 ? 'x' : ''}
                      </div>
                    </div>
                  )}

                  {gameType === 'dropping' && previewGame.content && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {previewGame.content.categories?.map((cat) => (
                          <span key={cat.id} className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-medium">
                            {cat.label}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {previewGame.content.items?.map((item) => (
                          <span key={item.id} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium">
                            {item.name} → <span className="text-indigo-500">{previewGame.content.categories?.find((c) => c.id === item.category)?.label || item.category}</span>
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {previewGame.content.items?.length || 0} éléments → {previewGame.content.categories?.length || 0} catégories
                      </div>
                    </div>
                  )}

                  {gameType === 'sequencing' && previewGame.content.steps?.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center">{s.order || i + 1}</span>
                      <span className="text-xs text-slate-900 dark:text-slate-100">{s.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Récapitulatif</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Titre</span><span className="text-slate-900 dark:text-slate-100 font-medium">{title}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Sujet</span><span className="text-slate-900 dark:text-slate-100">{topic || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Type</span><span className="text-slate-900 dark:text-slate-100 capitalize">{gameType}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Difficulté</span><span className="text-slate-900 dark:text-slate-100 capitalize">{difficulty}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Contenu</span><span className="text-slate-900 dark:text-slate-100">{lessonText.length} caractères</span></div>
                  {previewGame && (
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Généré</span><span className="text-slate-900 dark:text-slate-100">
                      {gameType === 'quiz' ? `${previewGame.content.questions?.length || 0} questions` : gameType === 'puzzle' || gameType === 'memory' ? `${previewGame.content.pairs?.length || 0} paires` : gameType === 'cloze' ? `${Object.keys(previewGame.content.blanks || {}).length} trous` : gameType === 'dropping' ? `${previewGame.content.items?.length || 0} éléments` : `${previewGame.content.steps?.length || 0} étapes`}
                    </span></div>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Le jeu sera ajouté à votre liste de jeux disponibles.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <button onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 rounded-lg text-sm transition-all duration-200">
            <ChevronLeft size={16} /> {step > 0 ? 'Retour' : 'Annuler'}
          </button>
          <div className="flex gap-2">
            {step < 3 ? (
              <button onClick={() => {
                if (step === 1 && !previewGame) {
                  handleGenerate()
                } else {
                  setStep(step + 1)
                }
              }} disabled={!canNext() || generating}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                {step === 1 ? 'Générer & Continuer' : 'Suivant'} <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleConfirm}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                <Check size={16} /> Créer le jeu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
