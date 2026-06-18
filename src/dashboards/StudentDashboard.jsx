import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { BookOpen, Puzzle, ListOrdered, Zap, ArrowRight, GraduationCap, Star, EyeOff, Wind, Award, Map, Brain, ArrowDownFromLine, Timer, Users, LayoutGrid, List } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import useGameStore from '../store/useGameStore'
import useSettingsStore from '../store/useSettingsStore'
import Leaderboard from '../components/Leaderboard'
import LevelUpToast from '../components/LevelUpToast'
import DailyChallenge from '../components/DailyChallenge'
import ChallengeSystem from '../components/ChallengeSystem'
import ActivityFeed from '../components/ActivityFeed'
import SkillTree from '../components/SkillsTree'
import CreationGallery from '../components/CreationGallery'
import OnboardingModal from '../components/OnboardingModal'
import ZenBreak from '../components/ZenBreak'
import MiniGame from '../components/MiniGame'
import MentorSystem from '../components/MentorSystem'
import { XP_PER_LEVEL, getLevel } from '../constants'
import { playSound } from '../utils/soundService'
import avatarEvents from '../utils/avatarEvents'

const QuizGame = lazy(() => import('../games/QuizGame'))
const PuzzleGame = lazy(() => import('../games/PuzzleGame'))
const SequencingGame = lazy(() => import('../games/SequencingGame'))
const MemoryGame = lazy(() => import('../games/MemoryGame'))
const ClozeGame = lazy(() => import('../games/ClozeGame'))
const DroppingMaterialGame = lazy(() => import('../games/DroppingMaterialGame'))

const gameIcons = { quiz: BookOpen, puzzle: Puzzle, sequencing: ListOrdered, memory: Brain, cloze: BookOpen, dropping: ArrowDownFromLine }

export default function StudentDashboard() {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const games = useGameStore((s) => s.games)
  const fogMode = useGameStore((s) => s.fogMode)
  const resolveChallenge = useGameStore((s) => s.resolveChallenge)
  const { gameTheme } = useSettingsStore()
  
  const [activeGameId, setActiveGameId] = useState(null)
  const [activeChallengeId, setActiveChallengeId] = useState(null)
  const [levelUpLevel, setLevelUpLevel] = useState(null)
  const [activeTab, setActiveTab] = useState('missions')
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [zenOpen, setZenOpen] = useState(false)
  const [miniGameOpen, setMiniGameOpen] = useState(false)
  const [mentorOpen, setMentorOpen] = useState(false)
  const [gameLayout, setGameLayout] = useState('list')

  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)
  const prevLevelRef = useRef(getLevel(student?.totalXP || 0))

  // Level Up Toast and sound effect trigger
  useEffect(() => {
      if (student && prevLevelRef.current !== undefined && getLevel(student.totalXP) > prevLevelRef.current) {
      setLevelUpLevel(getLevel(student.totalXP))
      playSound.levelUp()
      avatarEvents.emit('levelup')
    }
    if (student) prevLevelRef.current = getLevel(student.totalXP)
  }, [student])

  // Welcome animation on mount
  useEffect(() => {
    const timer = setTimeout(() => avatarEvents.emit('welcome'), 800)
    return () => clearTimeout(timer)
  }, [])

  // Check if onboarding needs to be shown
  useEffect(() => {
    if (student) {
      const key = `ppe-onboarded-${student.id}`
      const done = localStorage.getItem(key)
      const t = setTimeout(() => {
        setOnboardingOpen(!done)
      }, 0)
      return () => clearTimeout(t)
    }
  }, [student])

  const handleOnboardingDone = () => {
    if (student) {
      localStorage.setItem(`ppe-onboarded-${student.id}`, 'true')
    }
    setOnboardingOpen(false)
  }

  if (!student) return <p className="text-slate-500 dark:text-slate-400 p-6">Sélectionnez un élève dans la barre de navigation.</p>

  const xpProgress = ((student.totalXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null

  const handlePlayGame = (gameId) => {
    playSound.click()
    setActiveGameId(gameId)
  }

  const handlePlayChallenge = (gameId, challengeId) => {
    playSound.click()
    setActiveChallengeId(challengeId)
    setActiveGameId(gameId)
  }

  // Intercept game completion back navigation to resolve challenge
  const handleGameBack = () => {
    playSound.click()
    if (activeChallengeId) {
      const latestPlay = student.completedGames
        .filter((cg) => cg.gameId === activeGameId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      if (latestPlay) {
        resolveChallenge(activeChallengeId, currentStudentId, latestPlay.score)
      }
      setActiveChallengeId(null)
    }
    setActiveGameId(null)
  }

  if (activeGame) {
    const themeClass = gameTheme && gameTheme !== 'default' ? `game-theme-${gameTheme}` : ''
    return (
      <div className={themeClass}>
        <Suspense fallback={<div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400 text-sm">Chargement du jeu...</div>}>
          {activeGame.gameType === 'quiz' && <QuizGame game={activeGame} onBack={handleGameBack} />}
          {activeGame.gameType === 'puzzle' && <PuzzleGame game={activeGame} onBack={handleGameBack} />}
          {activeGame.gameType === 'sequencing' && <SequencingGame game={activeGame} onBack={handleGameBack} />}
          {activeGame.gameType === 'memory' && <MemoryGame game={activeGame} onBack={handleGameBack} />}
          {activeGame.gameType === 'cloze' && <ClozeGame game={activeGame} onBack={handleGameBack} />}
          {activeGame.gameType === 'dropping' && <DroppingMaterialGame game={activeGame} onBack={handleGameBack} />}
        </Suspense>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Area: Student Stats & Main Content tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Student Banner */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${student.avatar?.color || 'from-slate-400 to-slate-600'} flex items-center justify-center text-2xl border border-white/30`}>
                  {student.avatar?.emoji || '👤'}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{student.name}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Niveau {getLevel(student.totalXP)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400 font-extrabold text-lg">
                <Zap size={20} className="fill-indigo-100 dark:fill-indigo-950" />
                <span>{student.totalXP} XP</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-250 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{student.totalXP % XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Niveau {getLevel(student.totalXP)} &rarr; Niveau {getLevel(student.totalXP) + 1}</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {[
              { id: 'missions', label: 'Missions Officielles', icon: GraduationCap },
              { id: 'tree', label: 'Mon Skill Tree', icon: Map },
              { id: 'gallery', label: 'Jeux Communauté', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound.click(); setActiveTab(tab.id) }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-655 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          {activeTab === 'missions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-600" />
                  Défis Enseignant
                </h2>
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setGameLayout('list')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${gameLayout === 'list' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    title="Vue liste"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setGameLayout('grid')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${gameLayout === 'grid' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    title="Vue grille"
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
              <div className={gameLayout === 'grid' ? 'grid grid-cols-2 gap-4' : 'grid gap-4'}>
                {games
                  .filter((g) => !g.isStudentCreated && !g.archived)
                  .map((game) => {
                    const Icon = gameIcons[game.gameType] || BookOpen
                    const completed = student.completedGames.find((c) => c.gameId === game.id)
                    return (
                      <button
                        key={game.id}
                        onClick={() => handlePlayGame(game.id)}
                        className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 group shadow-sm hover:shadow-md ${
                          gameLayout === 'grid'
                            ? 'p-4 flex flex-col items-center text-center'
                            : 'p-5 flex items-start justify-between'
                        }`}
                      >
                        {gameLayout === 'grid' ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                              <Icon size={24} />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-200 line-clamp-1">{game.title}</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{game.topic}</p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                                {game.gameType === 'quiz' ? 'Quiz' : game.gameType === 'puzzle' ? 'Puzzle' : game.gameType === 'memory' ? 'Memory' : game.gameType === 'cloze' ? 'Texte à trous' : game.gameType === 'dropping' ? 'Tri par chute' : 'Séquencement'}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                                {[1, 2, 3].map((s) => (
                                  <Star key={s} size={8} className={s <= (game.difficulty === 'easy' ? 1 : game.difficulty === 'hard' ? 3 : 2) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-650'} />
                                ))}
                              </span>
                            </div>
                            {completed ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                                {student.bestScores?.[game.id] != null && student.bestScores[game.id] > completed.score
                                  ? `Meilleur: ${student.bestScores[game.id]}%`
                                  : `✓ ${completed.score}%`}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">+50 XP</span>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Icon size={20} />
                              </div>
                              <div>
                                <h3 className="text-slate-900 dark:text-slate-100 font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-200">{game.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{game.topic}</p>
                                {game.comment && (
                                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 italic">{game.comment}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                                    {game.gameType === 'quiz' ? 'Quiz' : game.gameType === 'puzzle' ? 'Puzzle' : game.gameType === 'memory' ? 'Memory' : game.gameType === 'cloze' ? 'Texte à trous' : game.gameType === 'dropping' ? 'Tri par chute' : 'Séquencement'}
                                  </span>
                                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                                    {[1, 2, 3].map((s) => (
                                      <Star key={s} size={10} className={s <= (game.difficulty === 'easy' ? 1 : game.difficulty === 'hard' ? 3 : 2) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-650'} />
                                    ))}
                                  </span>
                                  <span className="text-xs text-slate-400 dark:text-slate-500">+50 XP</span>
                                  {completed && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                      {student.bestScores?.[game.id] != null && student.bestScores[game.id] > completed.score
                                        ? `Meilleur: ${student.bestScores[game.id]}%`
                                        : `Complété · ${completed.score}%`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-all duration-200 shrink-0 mt-2" />
                          </>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {activeTab === 'tree' && <SkillTree onPlayGame={handlePlayGame} />}

          {activeTab === 'gallery' && <CreationGallery onPlayGame={handlePlayGame} />}

        </div>

        {/* Right Area: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Daily Challenge Card */}
          <DailyChallenge />

          {/* Peer Challenges widget */}
          <ChallengeSystem onPlayChallenge={handlePlayChallenge} />

          {/* Leaderboard or Fog widget */}
          {fogMode ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center shadow-sm">
              <EyeOff size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3 animate-pulse" />
              <p className="text-sm text-slate-550 dark:text-slate-400">Le classement est masqué pendant la session.</p>
            </div>
          ) : (
            <Leaderboard />
          )}

          {/* Class Activity social Feed */}
          <ActivityFeed />

          {/* Mini-game Flash */}
          <button
            onClick={() => { playSound.click(); setMiniGameOpen(true) }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Timer size={16} />
            <span>Mini-jeu Flash (30s)</span>
          </button>

          {/* Mentor System */}
          <button
            onClick={() => { playSound.click(); setMentorOpen(true) }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Users size={16} />
            <span>Mentorat</span>
          </button>

          {/* Zen Break card/button */}
          <button
            onClick={() => { playSound.click(); setZenOpen(true) }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-650 hover:to-teal-650 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Wind size={16} className="animate-spin duration-3000" />
            <span>🧘 Lancer une Pause Zen</span>
          </button>
        </div>
      </div>

      {/* Modals & Popups */}
      {onboardingOpen && <OnboardingModal onDone={handleOnboardingDone} />}
      {zenOpen && <ZenBreak onClose={() => setZenOpen(false)} />}
      {miniGameOpen && <MiniGame onClose={() => setMiniGameOpen(false)} />}
      {mentorOpen && <MentorSystem onClose={() => setMentorOpen(false)} />}
      <LevelUpToast level={levelUpLevel} onDone={() => setLevelUpLevel(null)} />
    </>
  )
}
