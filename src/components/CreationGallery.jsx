import { useState } from 'react'
import { Plus, Check, Play, BookOpen, Trash2, Award, Info } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'

export default function CreationGallery({ onPlayGame }) {
  const games = useGameStore((s) => s.games)
  const submitStudentQuiz = useGameStore((s) => s.submitStudentQuiz)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const currentStudent = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)

  const [activeTab, setActiveTab] = useState('gallery')
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('Architecture')
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctIndex: 0, concept: 'Général' }
  ])
  const [successMsg, setSuccessMsg] = useState('')

  const communityGames = games.filter((g) => g.isStudentCreated && g.approved)
  const pendingGames = games.filter((g) => g.isStudentCreated && g.createdBy === currentStudentId && !g.approved)

  const handleAddQuestion = () => {
    playSound.click()
    setQuestions([
      ...questions,
      { question: '', options: ['', '', '', ''], correctIndex: 0, concept: 'Général' }
    ])
  }

  const handleRemoveQuestion = (idx) => {
    playSound.click()
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleQuestionChange = (qIdx, field, val) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIdx) return q
      return { ...q, [field]: val }
    }))
  }

  const handleOptionChange = (qIdx, optIdx, val) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIdx) return q
      const newOpts = [...q.options]
      newOpts[optIdx] = val
      return { ...q, options: newOpts }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || questions.length === 0) return

    // Simple validation
    const invalid = questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))
    if (invalid) {
      alert("Veuillez remplir toutes les questions et options !")
      return
    }

    if (currentStudentId && currentStudent) {
      submitStudentQuiz(currentStudentId, currentStudent.name, title.trim(), topic, questions)
      playSound.levelUp()
      setSuccessMsg("Votre jeu a été envoyé à l'enseignant pour validation ! 🎉")
      setTitle('')
      setQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0, concept: 'Général' }])
      setTimeout(() => {
        setSuccessMsg('')
        setActiveTab('gallery')
      }, 3000)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="text-indigo-600 dark:text-indigo-400" size={22} />
            Galerie des Créations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Créez vos propres jeux et jouez à ceux de vos camarades.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5">
          <button
            onClick={() => { playSound.click(); setActiveTab('gallery') }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${activeTab === 'gallery' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Communauté ({communityGames.length})
          </button>
          <button
            onClick={() => { playSound.click(); setActiveTab('create') }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${activeTab === 'create' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            <span className="flex items-center gap-1"><Plus size={12} /> Créer un quiz</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-4 py-3 rounded-lg text-sm font-medium text-center animate-pulse">
          {successMsg}
        </div>
      )}

      {activeTab === 'gallery' ? (
        <div className="space-y-6">
          {pendingGames.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Info size={14} /> Mes créations en cours de validation
              </h3>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {pendingGames.map((g) => (
                  <div key={g.id} className="border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 rounded-xl p-4 flex items-center justify-between text-left">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{g.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{g.topic} · {g.content.questions.length} questions</p>
                    </div>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold">En attente</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Quiz de la classe</h3>
            {communityGames.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <BookOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={36} />
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucun jeu partagé pour l'instant.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Soyez le premier à en créer un !</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {communityGames.map((game) => (
                  <div key={game.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold">{game.topic}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-550">Par {game.createdByName}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{game.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{game.content.questions.length} questions · +25 XP</p>
                    </div>
                    <button
                      onClick={() => { playSound.click(); onPlayGame(game.id) }}
                      className="mt-4 w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm"
                    >
                      <Play size={12} fill="white" /> Jouer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Titre du Quiz</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Les composants de la carte mère"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Concept principal</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
              >
                <option value="Architecture">Architecture</option>
                <option value="Algorithmique">Algorithmique</option>
                <option value="Réseaux">Réseaux</option>
                <option value="Sécurité">Sécurité</option>
                <option value="Base de données">Base de données</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Questions</h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                <Plus size={14} /> Ajouter une question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 relative animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-500">Question {qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-red-500 hover:text-red-650"
                      title="Supprimer la question"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                    placeholder="Écrivez la question..."
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => handleQuestionChange(qIdx, 'correctIndex', optIdx)}
                          className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Check size={16} /> Partager avec la classe
          </button>
        </form>
      )}
    </div>
  )
}
