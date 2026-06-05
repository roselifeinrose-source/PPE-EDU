import { useState } from 'react'
import { Plus, BookOpen, AlertTriangle, Users, TrendingUp, Play, Edit3, Trash2, Check, X, Save } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import { generateGameFromText } from '../utils/aiService'
import QuizGame from '../games/QuizGame'
import PuzzleGame from '../games/PuzzleGame'
import SequencingGame from '../games/SequencingGame'

const gameTypeLabel = (t) => (t === 'quiz' ? 'Quiz' : t === 'puzzle' ? 'Puzzle' : 'Séquencement')

export default function TeacherDashboard() {
  const { games, addGame, removeGame, updateGame, students } = useGameStore()
  const [showCreator, setShowCreator] = useState(false)
  const [lessonText, setLessonText] = useState('')
  const [gameType, setGameType] = useState('quiz')
  const [generating, setGenerating] = useState(false)
  const [previewId, setPreviewId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTopic, setEditTopic] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const avgScore = games.length
    ? Math.round(games.reduce((sum, g) => sum + g.analytics.averageScore, 0) / games.length)
    : 0

  const isApiKeyMissing = import.meta.env.VITE_GEMINI_API_KEY === undefined || import.meta.env.VITE_GEMINI_API_KEY.trim() === ''

  const failedConcepts = games.flatMap((g) =>
    (g.analytics.failedConcepts || []).map((c) => ({ concept: c, gameTitle: g.title }))
  )

  const handleGenerate = async () => {
    if (!lessonText.trim()) return
    setGenerating(true)
    const game = await generateGameFromText(lessonText, gameType)
    addGame(game)
    setGenerating(false)
    setShowCreator(false)
    setLessonText('')
  }

  const startEdit = (game) => {
    setEditingId(game.id)
    setEditTitle(game.title)
    setEditTopic(game.topic)
  }

  const saveEdit = () => {
    updateGame(editingId, { title: editTitle, topic: editTopic })
    setEditingId(null)
  }

  const confirmDelete = (id) => {
    removeGame(id)
    setDeletingId(null)
  }

  const previewGame = previewId ? games.find((g) => g.id === previewId) : null
  if (previewGame) {
    const back = () => setPreviewId(null)
    if (previewGame.gameType === 'quiz') return <QuizGame game={previewGame} onBack={back} />
    if (previewGame.gameType === 'puzzle') return <PuzzleGame game={previewGame} onBack={back} />
    if (previewGame.gameType === 'sequencing') return <SequencingGame game={previewGame} onBack={back} />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tableau de Bord Enseignant</h1>
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <Plus size={18} /> Nouveau Jeu
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
            <BookOpen size={18} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Jeux Créés</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{games.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <Users size={18} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Élèves Actifs</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{students.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Score Moyen</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{avgScore}%</div>
        </div>
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

      {showCreator && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Créer un jeu éducatif</h2>
          <div className="space-y-4">
            <textarea
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Coller la leçon ici..."
            />
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              >
                <option value="quiz">Quiz à choix multiples</option>
                <option value="puzzle">Puzzle d'association</option>
                <option value="sequencing">Séquencement</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating || !lessonText.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              >
                {generating ? 'Génération en cours...' : "Générer le jeu éducatif"}
              </button>
              <button onClick={() => setShowCreator(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2.5 text-sm transition-all duration-200">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {failedConcepts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Concepts Mal Maîtrisés
          </h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
            {failedConcepts.map((fc, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{fc.concept}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{fc.gameTitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Jeux Disponibles</h2>
        <div className="grid gap-3">
          {games.map((game) => {
            const isEditing = editingId === game.id
            const isDeleting = deletingId === game.id

            return (
              <div key={game.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 transition-all duration-200">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      placeholder="Titre du jeu"
                    />
                    <input
                      value={editTopic}
                      onChange={(e) => setEditTopic(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      placeholder="Sujet"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200">
                        <Save size={14} /> Enregistrer
                      </button>
                      <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg text-xs transition-all duration-200">
                        <X size={14} /> Annuler
                      </button>
                    </div>
                  </div>
                ) : isDeleting ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">Supprimer ce jeu ?</span>
                    <div className="flex gap-2">
                      <button onClick={() => confirmDelete(game.id)} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200">
                        <Check size={14} /> Confirmer
                      </button>
                      <button onClick={() => setDeletingId(null)} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg text-xs transition-all duration-200">
                        <X size={14} /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-slate-900 dark:text-slate-100 font-semibold truncate">{game.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md whitespace-nowrap">
                            {gameTypeLabel(game.gameType)}
                          </span>
                          <span className="truncate">{game.topic}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500 dark:text-slate-400 shrink-0 ml-4">
                        <div>{game.analytics.attempts} tentative{game.analytics.attempts > 1 ? 's' : ''}</div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-medium">{game.analytics.averageScore}% moyen</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => setPreviewId(game.id)}
                        className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      >
                        <Play size={14} /> Tester
                      </button>
                      <button
                        onClick={() => startEdit(game)}
                        className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      >
                        <Edit3 size={14} /> Modifier
                      </button>
                      <button
                        onClick={() => setDeletingId(game.id)}
                        className="flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      >
                        <Trash2 size={14} /> Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
