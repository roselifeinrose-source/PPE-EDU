import { useState, useMemo, lazy, Suspense } from 'react'
import { Search, Download, Archive, Trash2, X, Award, FileText, LayoutGrid, List, Gamepad2, Plus } from 'lucide-react'
import useGameStore from '../../store/useGameStore'
import useSettingsStore from '../../store/useSettingsStore'
import { downloadQTI } from '../../utils/qtiExport'
import GameCard from '../../components/GameCard'
import GameRow from '../../components/GameRow'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import SessionDashboard from '../../components/SessionDashboard'
import PresentationMode from '../../components/PresentationMode'
import PublicationCalendar from '../../components/PublicationCalendar'
import FogMode from '../../components/FogMode'
import ActivityLogs from '../../components/ActivityLogs'
import ManualGrading from '../../components/ManualGrading'
import GenerationModal from '../../components/GenerationModal'
import GameManager from '../../components/GameManager'

const QuizGame = lazy(() => import('../../games/QuizGame'))
const PuzzleGame = lazy(() => import('../../games/PuzzleGame'))
const SequencingGame = lazy(() => import('../../games/SequencingGame'))
const MemoryGame = lazy(() => import('../../games/MemoryGame'))
const ClozeGame = lazy(() => import('../../games/ClozeGame'))
const DroppingMaterialGame = lazy(() => import('../../games/DroppingMaterialGame'))

export default function TeacherGamesPage() {
  const games = useGameStore((s) => s.games)
  const removeGame = useGameStore((s) => s.removeGame)
  const updateGame = useGameStore((s) => s.updateGame)
  const duplicateGame = useGameStore((s) => s.duplicateGame)
  const archiveGame = useGameStore((s) => s.archiveGame)
  const approveStudentQuiz = useGameStore((s) => s.approveStudentQuiz)
  const saveGameVersion = useGameStore((s) => s.saveGameVersion)
  const gameTheme = useSettingsStore((s) => s.gameTheme)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('games_view') || 'list')
  const [selectedIds, setSelectedIds] = useState([])
  const [showArchived, setShowArchived] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editTopic, setEditTopic] = useState('')
  const [editContent, setEditContent] = useState(null)
  const [activeTab, setActiveTab] = useState('games')
  const [editComment, setEditComment] = useState('')
  const [deletingGame, setDeletingGame] = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const [showSession, setShowSession] = useState(false)
  const [sessionGameId, setSessionGameId] = useState(null)
  const [showPresentation, setShowPresentation] = useState(false)
  const [genProgress, setGenProgress] = useState(null)
  const [genError, setGenError] = useState(null)

  const setView = (mode) => {
    setViewMode(mode)
    localStorage.setItem('games_view', mode)
  }

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const isArchived = g.archived || false
      if (!showArchived && isArchived) return false
      const matchesSearch = !searchQuery ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = filterType === 'all' || g.gameType === filterType
      return matchesSearch && matchesType
    })
  }, [games, searchQuery, filterType, showArchived])

  const toggleSelect = (id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const bulkDelete = () => {
    if (!window.confirm(`Supprimer ${selectedIds.length} jeu${selectedIds.length > 1 ? 'x' : ''} ? Cette action est irréversible.`)) return
    selectedIds.forEach((id) => removeGame(id))
    setSelectedIds([])
  }

  const exportJSON = () => {
    const data = games.map(({ id, title, subject, topic, gameType, content, createdAt }) => ({ id, title, subject, topic, gameType, content, createdAt }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jeux-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const startEdit = (game) => {
    setEditingId(game.id)
    setEditTitle(game.title)
    setEditTopic(game.topic)
    setEditContent(JSON.parse(JSON.stringify(game.content)))
    setEditComment(game.comment || '')
  }

  const saveEdit = () => {
    saveGameVersion(editingId)
    updateGame(editingId, { title: editTitle, topic: editTopic, content: editContent, comment: editComment })
    setEditingId(null)
    setEditContent(null)
    setEditComment('')
  }

  const confirmDelete = (id) => {
    removeGame(id)
    setDeletingGame(null)
  }

  const previewGame = previewId ? games.find((g) => g.id === previewId) : null
  if (previewGame) {
    const back = () => setPreviewId(null)
    const themeClass = gameTheme && gameTheme !== 'default' ? `game-theme-${gameTheme}` : ''
    return (
      <div className={themeClass}>
        <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400 text-sm">Chargement du jeu...</div>}>
          {previewGame.gameType === 'quiz' && <QuizGame game={previewGame} onBack={back} />}
          {previewGame.gameType === 'puzzle' && <PuzzleGame game={previewGame} onBack={back} />}
          {previewGame.gameType === 'sequencing' && <SequencingGame game={previewGame} onBack={back} />}
          {previewGame.gameType === 'memory' && <MemoryGame game={previewGame} onBack={back} />}
          {previewGame.gameType === 'cloze' && <ClozeGame game={previewGame} onBack={back} />}
          {previewGame.gameType === 'dropping' && <DroppingMaterialGame game={previewGame} onBack={back} />}
        </Suspense>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab('games')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'games' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          <Award size={15} /> Mes Jeux
        </button>
        <button onClick={() => setActiveTab('manage')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'manage' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          <Gamepad2 size={15} /> Gestion rapide
        </button>
      </div>

      {activeTab === 'manage' ? (
        <GameManager />
      ) : (
        <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mes Jeux</h1>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
            <button onClick={bulkDelete} className="flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all">
              <Trash2 size={13} /> Supprimer
            </button>
            <button onClick={() => setSelectedIds([])} className="text-slate-400 hover:text-slate-600 px-1.5 py-1.5 rounded-lg transition-all">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un jeu..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <option value="all">Tous les types</option>
          <option value="quiz">Quiz</option>
          <option value="puzzle">Puzzle</option>
          <option value="sequencing">Séquencement</option>
          <option value="memory">Memory</option>
          <option value="cloze">Texte à trous</option>
          <option value="dropping">Tri par chute</option>
        </select>

        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button onClick={() => setView('grid')} className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Vue grille">
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView('list')} className={`p-2 transition-all ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Vue liste">
            <List size={16} />
          </button>
        </div>

        <button onClick={exportJSON} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 px-2.5 py-2 rounded-lg text-xs font-medium transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
          <Download size={13} /> JSON
        </button>
        <button
          onClick={() => {
            const quizGames = games.filter((g) => g.gameType === 'quiz' && !g.archived)
            if (quizGames.length === 0) { alert('Aucun quiz à exporter.'); return }
            quizGames.forEach((g) => downloadQTI(g))
          }}
          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 px-2.5 py-2 rounded-lg text-xs font-medium transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          <FileText size={13} /> QTI
        </button>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${showArchived ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          <Archive size={13} /> {showArchived ? 'Masquer archivés' : 'Archivés'}
        </button>
      </div>

      {/* Game list */}
      {games.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucun jeu créé pour le moment.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Allez dans « Créer un Jeu » pour commencer.</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
          <Search size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Aucun jeu ne correspond à votre recherche.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              selected={selectedIds.includes(game.id)}
              onToggleSelect={toggleSelect}
              onPreview={setPreviewId}
              onEdit={startEdit}
              onDelete={setDeletingGame}
              onDuplicate={duplicateGame}
              onArchive={archiveGame}
              onSession={(id) => { setSessionGameId(id); setShowSession(true) }}
              onPresent={(id) => { setSessionGameId(id); setShowPresentation(true) }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGames.map((game) => (
            <GameRow
              key={game.id}
              game={game}
              selected={selectedIds.includes(game.id)}
              onToggleSelect={toggleSelect}
              onPreview={setPreviewId}
              onEdit={startEdit}
              onDelete={setDeletingGame}
              onDuplicate={duplicateGame}
              onArchive={archiveGame}
              onSession={(id) => { setSessionGameId(id); setShowSession(true) }}
              onPresent={(id) => { setSessionGameId(id); setShowPresentation(true) }}
            />
          ))}
        </div>
      )}

      {/* Student quiz moderation */}
      {games.some((g) => g.isStudentCreated && !g.approved) && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Award className="text-indigo-500" size={16} /> Modération des créations élèves
          </h3>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {games.filter((g) => g.isStudentCreated && !g.approved).map((g) => (
              <div key={g.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{g.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Créé par {g.createdByName} · {g.topic}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveStudentQuiz(g.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Approuver</button>
                  <button onClick={() => removeGame(g.id)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PublicationCalendar />
        <FogMode />
        <ActivityLogs />
      </div>

      <ManualGrading />

      {/* Modals */}
      {showSession && sessionGameId && (
        <SessionDashboard gameId={sessionGameId} onClose={() => { setShowSession(false); setSessionGameId(null) }} />
      )}
      {showPresentation && sessionGameId && (
        <PresentationMode gameId={sessionGameId} onClose={() => { setShowPresentation(false); setSessionGameId(null) }} />
      )}
      <DeleteConfirmModal
        open={!!deletingGame}
        gameTitle={deletingGame?.title || ''}
        onConfirm={() => confirmDelete(deletingGame?.id)}
        onCancel={() => setDeletingGame(null)}
      />
      <GenerationModal open={genProgress === 'done'} progress={genProgress} error={genError} onClose={() => { setGenProgress(null); setGenError(null) }} />

      {/* Inline editing overlay */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Modifier le jeu</h2>
              <button onClick={() => { setEditingId(null); setEditContent(null) }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" placeholder="Titre" />
              <input value={editTopic} onChange={(e) => setEditTopic(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" placeholder="Sujet" />
              <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={2} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-400" placeholder="Consigne (optionnel)" />
              {editContent && <EditContentSection editContent={editContent} setEditContent={setEditContent} />}
              {games.find((g) => g.id === editingId)?.versions?.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Versions précédentes :</span>
                  {games.find((g) => g.id === editingId).versions.map((v, vidx) => (
                    <div key={vidx} className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Sauvegardé le {new Date(v.savedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <button type="button" onClick={() => { setEditTitle(v.title); setEditTopic(v.topic); setEditContent(JSON.parse(JSON.stringify(v.content))) }} className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Restaurer</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={saveEdit} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">Enregistrer</button>
                <button onClick={() => { setEditingId(null); setEditContent(null) }} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-4 py-2 text-sm transition-all">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}

function uid() { return 'x' + Date.now() + Math.random().toString(36).slice(2, 6) }

function EditContentSection({ editContent, setEditContent }) {
  const type = editContent.questions ? 'quiz' : editContent.steps ? 'sequencing' : editContent.pairs ? (editContent.pairs[0]?.left?.length > 30 ? 'memory' : 'puzzle') : editContent.blanks ? 'cloze' : 'dropping'

  if (type === 'quiz' && editContent.questions) {
    const addQuestion = () => {
      const id = uid()
      setEditContent({ ...editContent, questions: [...editContent.questions, { id, question: '', options: ['', '', '', ''], correctIndex: 0 }] })
    }
    const removeQuestion = (qi) => {
      const u = editContent.questions.filter((_, i) => i !== qi)
      setEditContent({ ...editContent, questions: u.length ? u : [{ id: uid(), question: '', options: ['', '', '', ''], correctIndex: 0 }] })
    }
    const addOption = (qi) => {
      const u = [...editContent.questions]; u[qi] = { ...u[qi], options: [...u[qi].options, ''], correctIndex: u[qi].correctIndex }
      setEditContent({ ...editContent, questions: u })
    }
    const removeOption = (qi, oi) => {
      const u = [...editContent.questions]
      const opts = u[qi].options.filter((_, i) => i !== oi)
      let ci = u[qi].correctIndex
      if (oi < ci) ci--
      else if (oi === ci && ci >= opts.length) ci = opts.length - 1
      u[qi] = { ...u[qi], options: opts, correctIndex: Math.max(0, ci) }
      setEditContent({ ...editContent, questions: u })
    }
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Questions</span>
        {editContent.questions.map((q, qi) => (
          <div key={q.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input value={q.question} onChange={(e) => { const u = [...editContent.questions]; u[qi] = { ...u[qi], question: e.target.value }; setEditContent({ ...editContent, questions: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder={`Question ${qi + 1}`} />
              <button onClick={() => removeQuestion(qi)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0" title="Supprimer cette question"><X size={13} /></button>
            </div>
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-1.5">
                <span onClick={() => { const u = [...editContent.questions]; u[qi] = { ...u[qi], correctIndex: oi }; setEditContent({ ...editContent, questions: u }) }} className={`cursor-pointer w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${oi === q.correctIndex ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'border-slate-300 dark:border-slate-600 text-slate-400'}`} title={oi === q.correctIndex ? 'Bonne réponse' : 'Cliquer pour définir comme bonne réponse'}>{String.fromCharCode(65 + oi)}</span>
                <input value={opt} onChange={(e) => { const u = [...editContent.questions]; const o = [...u[qi].options]; o[oi] = e.target.value; u[qi] = { ...u[qi], options: o }; setEditContent({ ...editContent, questions: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" />
                <button onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2} className="p-0.5 text-slate-300 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed" title="Supprimer cette option"><X size={11} /></button>
              </div>
            ))}
            <button onClick={() => addOption(qi)} className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium">+ Ajouter une option</button>
          </div>
        ))}
        <button onClick={addQuestion} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"><Plus size={12} /> Ajouter une question</button>
      </div>
    )
  }

  if (type === 'sequencing' && editContent.steps) {
    const addStep = () => {
      const id = uid()
      const steps = [...editContent.steps, { id, order: editContent.steps.length + 1, text: '' }]
      setEditContent({ ...editContent, steps })
    }
    const removeStep = (si) => {
      let u = editContent.steps.filter((_, i) => i !== si)
      u = u.map((s, i) => ({ ...s, order: i + 1 }))
      if (!u.length) u = [{ id: uid(), order: 1, text: '' }]
      setEditContent({ ...editContent, steps: u })
    }
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Étapes</span>
        {editContent.steps.map((st, si) => (
          <div key={st.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">{si + 1}</span>
            <input value={st.text} onChange={(e) => { const u = [...editContent.steps]; u[si] = { ...u[si], text: e.target.value }; setEditContent({ ...editContent, steps: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" />
            <button onClick={() => removeStep(si)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0" title="Supprimer cette étape"><X size={13} /></button>
          </div>
        ))}
        <button onClick={addStep} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"><Plus size={12} /> Ajouter une étape</button>
      </div>
    )
  }

  if ((type === 'puzzle' || type === 'memory') && editContent.pairs) {
    const addPair = () => {
      const id = uid()
      setEditContent({ ...editContent, pairs: [...editContent.pairs, { id, left: '', right: '' }] })
    }
    const removePair = (pi) => {
      const u = editContent.pairs.filter((_, i) => i !== pi)
      if (!u.length) u.push({ id: uid(), left: '', right: '' })
      setEditContent({ ...editContent, pairs: u })
    }
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Paires</span>
        {editContent.pairs.map((p, pi) => (
          <div key={p.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <input value={p.left} onChange={(e) => { const u = [...editContent.pairs]; u[pi] = { ...u[pi], left: e.target.value }; setEditContent({ ...editContent, pairs: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Terme" />
            <span className="text-slate-400 text-xs">←→</span>
            <input value={p.right} onChange={(e) => { const u = [...editContent.pairs]; u[pi] = { ...u[pi], right: e.target.value }; setEditContent({ ...editContent, pairs: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Définition" />
            <button onClick={() => removePair(pi)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0" title="Supprimer cette paire"><X size={13} /></button>
          </div>
        ))}
        <button onClick={addPair} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"><Plus size={12} /> Ajouter une paire</button>
      </div>
    )
  }

  if (type === 'cloze' && editContent.blanks) {
    const addBlank = () => {
      const n = Object.keys(editContent.blanks).length + 1
      const id = `blank${n}`
      setEditContent({ ...editContent, blanks: { ...editContent.blanks, [id]: { correct: '', options: ['', '', ''] } } })
    }
    const removeBlank = (blankId) => {
      const u = { ...editContent.blanks }; delete u[blankId]; const entries = Object.entries(u)
      if (!entries.length) { setEditContent({ ...editContent, blanks: { blank1: { correct: '', options: ['', '', ''] } } }); return }
      const rekeyed = Object.fromEntries(entries.map(([, v], i) => [`blank${i + 1}`, v]))
      setEditContent({ ...editContent, blanks: rekeyed })
    }
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Texte avec trous</span>
        <textarea value={editContent.text || ''} onChange={(e) => setEditContent({ ...editContent, text: e.target.value })} rows={4} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none" placeholder="[blank1], [blank2], etc." />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Réponses</span>
        {Object.entries(editContent.blanks).map(([blankId, data]) => (
          <div key={blankId} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <span className="text-[10px] font-mono text-slate-400 shrink-0 w-14">{blankId}</span>
            <input value={data.correct} onChange={(e) => { const u = { ...editContent.blanks }; u[blankId] = { ...u[blankId], correct: e.target.value }; setEditContent({ ...editContent, blanks: u }) }} className="w-28 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Réponse" />
            <input value={(data.options || []).join(', ')} onChange={(e) => { const u = { ...editContent.blanks }; u[blankId] = { ...u[blankId], options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }; setEditContent({ ...editContent, blanks: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Options (virgule)" />
            <button onClick={() => removeBlank(blankId)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0" title="Supprimer ce trou"><X size={13} /></button>
          </div>
        ))}
        <button onClick={addBlank} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"><Plus size={12} /> Ajouter un trou</button>
      </div>
    )
  }

  if (type === 'dropping' && editContent.categories) {
    const addCategory = () => {
      const id = uid()
      setEditContent({ ...editContent, categories: [...editContent.categories, { id, label: '' }] })
    }
    const removeCategory = (ci) => {
      const catId = editContent.categories[ci].id
      const cats = editContent.categories.filter((_, i) => i !== ci)
      const items = editContent.items?.map((it) => it.category === catId ? { ...it, category: cats[0]?.id || '' } : it) || []
      setEditContent({ ...editContent, categories: cats.length ? cats : [{ id: uid(), label: '' }], items })
    }
    const addItem = () => {
      const id = uid()
      const catId = editContent.categories[0]?.id || ''
      setEditContent({ ...editContent, items: [...(editContent.items || []), { id, name: '', category: catId }] })
    }
    const removeItem = (ii) => {
      const u = editContent.items.filter((_, i) => i !== ii)
      setEditContent({ ...editContent, items: u.length ? u : [] })
    }
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Catégories</span>
        {editContent.categories.map((cat, ci) => (
          <div key={cat.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <input value={cat.label} onChange={(e) => { const u = [...editContent.categories]; u[ci] = { ...u[ci], label: e.target.value }; setEditContent({ ...editContent, categories: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Nom de la catégorie" />
            <button onClick={() => removeCategory(ci)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0" title="Supprimer cette catégorie"><X size={13} /></button>
          </div>
        ))}
        <button onClick={addCategory} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"><Plus size={12} /> Ajouter une catégorie</button>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-1 block">Éléments</span>
        {editContent.items?.map((item, ii) => (
          <div key={item.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <input value={item.name} onChange={(e) => { const u = [...editContent.items]; u[ii] = { ...u[ii], name: e.target.value }; setEditContent({ ...editContent, items: u }) }} className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30" placeholder="Nom" />
            <span className="text-slate-400 text-xs">→</span>
            <select value={item.category} onChange={(e) => { const u = [...editContent.items]; u[ii] = { ...u[ii], category: e.target.value }; setEditContent({ ...editContent, items: u }) }} className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30">
              {editContent.categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.label || cat.id}</option>)}
            </select>
            <button onClick={() => removeItem(ii)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded shrink-0" title="Supprimer cet élément"><X size={13} /></button>
          </div>
        ))}
        <button onClick={addItem} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"><Plus size={12} /> Ajouter un élément</button>
      </div>
    )
  }

  return null
}
