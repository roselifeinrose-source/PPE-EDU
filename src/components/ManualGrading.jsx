import { useState } from 'react'
import { ClipboardCheck, ChevronDown, ChevronUp, Check, Minus, Zap, MessageSquare } from 'lucide-react'
import useGameStore from '../store/useGameStore'

function ScoreSlider({ value, onChange }) {
  const color = value >= 75 ? 'emerald' : value >= 50 ? 'amber' : 'red'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">Note</span>
        <span className={`text-sm font-bold ${
          color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400'
          : color === 'amber' ? 'text-amber-600 dark:text-amber-400'
          : 'text-red-500 dark:text-red-400'
        }`}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

export default function ManualGrading() {
  const pendingGrades = useGameStore((s) => s.pendingGrades)
  const gradeAnswer = useGameStore((s) => s.gradeAnswer)
  const games = useGameStore((s) => s.games)
  const [expanded, setExpanded] = useState(true)
  const [scores, setScores] = useState({})
  const [graded, setGraded] = useState({})
  const [feedback, setFeedback] = useState({})

  const setScore = (id, val) => setScores((s) => ({ ...s, [id]: val }))
  const setNote = (id, val) => setFeedback((f) => ({ ...f, [id]: val }))

  const handleGrade = (id) => {
    const score = scores[id] ?? 50
    gradeAnswer(id, score)
    setGraded((g) => ({ ...g, [id]: score }))
  }

  const handleReject = (id) => {
    gradeAnswer(id, 0)
    setGraded((g) => ({ ...g, [id]: 0 }))
  }

  const pending = pendingGrades || []
  const count = pending.length

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
            <ClipboardCheck size={16} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Correction Manuelle</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {count === 0 ? 'Aucune réponse en attente' : `${count} réponse${count > 1 ? 's' : ''} à corriger`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {count === 0 ? (
            <div className="px-5 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-3">
                <Check size={20} className="text-emerald-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Toutes les réponses ont été corrigées !</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Les nouvelles réponses ouvertes apparaîtront ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
              {pending.map((grade) => {
                const game = games.find((g) => g.id === grade.gameId)
                const score = scores[grade.id] ?? 50
                const isGraded = !!graded[grade.id]
                return (
                  <div key={grade.id} className={`p-4 transition-all duration-300 ${isGraded ? 'opacity-40' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                            {grade.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{grade.studentName}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{game?.title || grade.gameId}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">❓ {grade.question}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap mt-1">
                        {new Date(grade.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Student answer */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-3">
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Réponse de l'élève :</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{grade.answer}</p>
                    </div>

                    {/* Teacher hint */}
                    {grade.hint && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg px-3 py-2 mb-3">
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">💡 Réponse attendue : {grade.hint}</p>
                      </div>
                    )}

                    {/* Feedback note (optional) */}
                    <div className="mb-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <MessageSquare size={11} /> Commentaire (optionnel)
                      </label>
                      <input
                        type="text"
                        value={feedback[grade.id] || ''}
                        onChange={(e) => setNote(grade.id, e.target.value)}
                        placeholder="Ex: Bonne idée, mais manque de détails..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400"
                        disabled={isGraded}
                      />
                    </div>

                    {/* Score slider */}
                    {!isGraded ? (
                      <div className="space-y-3">
                        <ScoreSlider value={score} onChange={(v) => setScore(grade.id, v)} />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGrade(grade.id)}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-1 justify-center"
                          >
                            <Check size={13} /> Valider ({score}% · +{Math.round((score / 100) * 30)} <Zap size={10} />)
                          </button>
                          <button
                            onClick={() => handleReject(grade.id)}
                            className="flex items-center gap-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border border-red-200 dark:border-red-800"
                          >
                            <Minus size={13} /> 0 pts
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-lg px-3 py-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span className="text-xs text-emerald-700 dark:text-emerald-300">
                          Corrigé : {graded[grade.id]}% · +{Math.round((graded[grade.id] / 100) * 30)} XP attribués
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {count > 0 && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                💡 Les XP sont attribués immédiatement après validation. Max 30 XP par réponse ouverte.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
