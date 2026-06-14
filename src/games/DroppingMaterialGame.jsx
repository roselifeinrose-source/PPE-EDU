import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { ArrowLeft, RefreshCw, Zap, HelpCircle, ArrowDown } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'
import avatarEvents from '../utils/avatarEvents'

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const FALL_SPEED = 3
const ITEM_SIZE = 80
const AREA_PADDING = 16

export default function DroppingMaterialGame({ game, onBack }) {
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)

  const content = game.content || {}
  const allItems = content.items || []
  const categories = useMemo(() => content.categories || [], [content.categories])
  const categoryCount = categories.length

  const [shuffledItems] = useState(() => shuffle(allItems))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentItem, setCurrentItem] = useState(() => shuffledItems[0] || null)
  const [itemX, setItemX] = useState(0)
  const [itemY, setItemY] = useState(-10)
  const [selectedBox, setSelectedBox] = useState(0)
  const [results, setResults] = useState([])
  const [finished, setFinished] = useState(false)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [showHint, setShowHint] = useState(false)
  const [dropping, setDropping] = useState(false)
  const [placedAnimation, setPlacedAnimation] = useState(null)

  const areaRef = useRef(null)
  const animFrameRef = useRef(null)
  const keysRef = useRef({})
  const droppingRef = useRef(false)
  const currentIndexRef = useRef(0)
  const currentItemRef = useRef(null)
  const selectedBoxRef = useRef(0)

  const getBoxCenterX = useCallback((boxIndex) => {
    if (!areaRef.current || categoryCount === 0) return 0
    const areaWidth = areaRef.current.offsetWidth - AREA_PADDING * 2
    const bw = (areaWidth - (categoryCount - 1) * 8) / categoryCount
    return AREA_PADDING + boxIndex * (bw + 8) + bw / 2
  }, [categoryCount])

  const finishGame = useCallback((allResults) => {
    setFinished(true)
    playSound.levelUp()
    const correctCount = allResults.filter((r) => r.isCorrect).length
    const totalItems = allResults.length
    const finalScore = Math.round((correctCount / totalItems) * 100)
    const xp = Math.round((finalScore / 100) * 50)
    if (currentStudentId) {
      submitGameResult(currentStudentId, game.id, finalScore, xp)
    }
  }, [currentStudentId, game.id, submitGameResult])

  const placeItem = useCallback((boxIndex) => {
    if (!currentItemRef.current) return
    droppingRef.current = false
    setDropping(false)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    const item = currentItemRef.current
    const cat = categories[boxIndex]
    const isCorrect = item.category === cat.id
    const newResult = {
      itemId: item.id,
      itemName: item.name,
      placedIn: cat.id,
      placedLabel: cat.label,
      correctCategory: item.category,
      isCorrect,
    }

    if (isCorrect) {
      playSound.correct()
      avatarEvents.emit('correct')
    } else {
      playSound.incorrect()
      avatarEvents.emit('wrong')
    }

    setPlacedAnimation({ x: itemX, y: itemY, correct: isCorrect })

    setResults((prev) => {
      const next = [...prev, newResult]
      setTimeout(() => {
        setPlacedAnimation(null)
        const nextIdx = currentIndexRef.current + 1
        if (nextIdx >= shuffledItems.length) {
          finishGame(next)
        } else {
          const nextItem = shuffledItems[nextIdx]
          currentIndexRef.current = nextIdx
          currentItemRef.current = nextItem
          setCurrentIndex(nextIdx)
          setCurrentItem(nextItem)
          setSelectedBox(0)
          selectedBoxRef.current = 0
          setTimeout(() => setItemX(getBoxCenterX(0)), 0)
          setItemY(-10)
          setDropping(false)
          droppingRef.current = false
          setShowHint(false)
        }
      }, 600)
      return next
    })
  }, [categories, itemX, itemY, shuffledItems, finishGame, getBoxCenterX])

  const dropItem = useCallback(() => {
    if (droppingRef.current || !currentItemRef.current) return
    playSound.click()
    droppingRef.current = true
    setDropping(true)
  }, [])

  useEffect(() => {
    if (!dropping || !currentItem) return

    const areaHeight = areaRef.current?.offsetHeight || 400
    const targetY = areaHeight - 60

    const animate = () => {
      setItemY((prev) => {
        if (prev >= targetY) {
          placeItem(selectedBoxRef.current)
          return prev
        }
        return prev + FALL_SPEED
      })
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [dropping, currentItem, placeItem])

  useEffect(() => {
    if (!currentItem || finished || dropping) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (!keysRef.current.ArrowLeft) {
          keysRef.current.ArrowLeft = true
          setSelectedBox((prev) => {
            const next = Math.max(0, prev - 1)
            selectedBoxRef.current = next
            setItemX(getBoxCenterX(next))
            return next
          })
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (!keysRef.current.ArrowRight) {
          keysRef.current.ArrowRight = true
          setSelectedBox((prev) => {
            const next = Math.min(categoryCount - 1, prev + 1)
            selectedBoxRef.current = next
            setItemX(getBoxCenterX(next))
            return next
          })
        }
      } else if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        if (!droppingRef.current) {
          dropItem()
        }
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') keysRef.current.ArrowLeft = false
      if (e.key === 'ArrowRight') keysRef.current.ArrowRight = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      keysRef.current = {}
    }
  }, [currentItem, finished, dropping, categoryCount, getBoxCenterX, dropItem])

  const useHint = () => {
    if (hintsLeft <= 0 || !currentItem) return
    playSound.click()
    setHintsLeft((h) => h - 1)
    setShowHint(true)
    setTimeout(() => setShowHint(false), 2000)
  }

  const initGame = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    const reshuffled = shuffle(allItems)
    setResults([])
    setFinished(false)
    setHintsLeft(3)
    setShowHint(false)
    setDropping(false)
    droppingRef.current = false
    setPlacedAnimation(null)
    if (reshuffled.length > 0) {
      const firstItem = reshuffled[0]
      currentIndexRef.current = 0
      currentItemRef.current = firstItem
      setCurrentIndex(0)
      setCurrentItem(firstItem)
      setSelectedBox(0)
      selectedBoxRef.current = 0
      setItemY(-10)
      setTimeout(() => setItemX(getBoxCenterX(0)), 0)
    }
    playSound.click()
  }

  const totalItems = allItems.length
  const correctCount = results.filter((r) => r.isCorrect).length
  const score = finished ? Math.round((correctCount / totalItems) * 100) : 0
  const xpGained = Math.round((score / 100) * 50)

  const hintCategory = currentItem
    ? categories.find((c) => c.id === currentItem.category)
    : null

  if (totalItems === 0 || categoryCount === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <ArrowLeft size={16} /> Retour
          </button>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{game.title}</h2>
          <div />
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Ce jeu ne contient pas de données. Modifiez-le depuis l'espace enseignant.</p>
        </div>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <ArrowLeft size={16} /> Retour
          </button>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{game.title}</h2>
          <button onClick={initGame} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all" title="Recommencer">
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center space-y-6 animate-in fade-in duration-300">
          <div className="text-5xl">🎯</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tri terminé !</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {correctCount} / {totalItems} éléments bien triés
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Score</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{score}%</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Correct</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{correctCount}</span>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-950/40 rounded-xl p-4 flex items-center justify-center gap-2">
            <Zap size={18} className="text-indigo-500 fill-indigo-500" />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">+{xpGained} XP gagnés !</span>
          </div>

          <div className="space-y-2 text-left max-w-sm mx-auto">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${r.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                <span className="font-bold">{r.itemName}</span>
                <span className="text-slate-400">→</span>
                <span>{r.placedLabel}</span>
                {!r.isCorrect && (
                  <span className="ml-auto text-[10px] opacity-70">({r.correctCategory})</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={initGame} className="flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 py-2.5 rounded-xl text-xs font-bold transition-colors">
              Rejouer
            </button>
            <button onClick={onBack} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-colors">
              Quitter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <ArrowLeft size={16} /> Retour
        </button>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-none">{game.title}</h2>
        <button onClick={initGame} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all" title="Recommencer">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Restants</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{totalItems - currentIndex}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Correct</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{correctCount}</span>
          </div>
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0}
            className="bg-slate-50 dark:bg-slate-900/50 hover:border-amber-400 disabled:opacity-50 rounded-lg p-2 text-center border border-slate-100 dark:border-slate-800/60 cursor-pointer transition-colors"
          >
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block items-center justify-center gap-1 flex">
              <HelpCircle size={10} /> Indices
            </span>
            <span className="text-lg font-extrabold text-amber-500">{hintsLeft}</span>
          </button>
        </div>
      </div>

      <div
        ref={areaRef}
        className="relative bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden select-none"
        style={{ height: '400px' }}
        tabIndex={0}
      >
        {showHint && hintCategory && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
            💡 → {hintCategory.label}
          </div>
        )}

        {currentItem && (
          <div
            className="absolute z-10 flex items-center justify-center transition-none"
            style={{
              left: `${itemX - ITEM_SIZE / 2}px`,
              top: `${itemY}px`,
              width: `${ITEM_SIZE}px`,
              height: '40px',
            }}
          >
            <div className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center h-full px-2 text-center leading-tight">
              {currentItem.name}
            </div>
          </div>
        )}

        {placedAnimation && (
          <div
            className="absolute z-10 flex items-center justify-center animate-in fade-in zoom-in-110 duration-200"
            style={{
              left: `${placedAnimation.x - ITEM_SIZE / 2}px`,
              top: `${placedAnimation.y}px`,
              width: `${ITEM_SIZE}px`,
              height: '40px',
            }}
          >
            <div className={`w-full text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center h-full px-2 ${placedAnimation.correct ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {placedAnimation.correct ? '✓' : '✗'}
            </div>
          </div>
        )}

        <div
          className="absolute bottom-0 left-0 right-0 flex gap-2"
          style={{ padding: `${AREA_PADDING}px` }}
        >
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-4 transition-all duration-200 ${
                selectedBox === i && !dropping
                  ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-[1.03]'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight px-1">
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        {selectedBox >= 0 && !dropping && (
          <div className="absolute bottom-[72px] left-0 right-0 flex justify-center pointer-events-none">
            <div className="flex gap-1">
              {categories.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-150 ${
                    i === selectedBox ? 'bg-indigo-500 scale-125' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3">
          Utilisez les touches <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">→</kbd> pour déplacer, puis <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">Espace</kbd> pour lâcher
        </p>
        <button
          onClick={dropItem}
          disabled={dropping || !currentItem}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
        >
          <ArrowDown size={16} /> Lâcher ({totalItems - currentIndex} restants)
        </button>
      </div>
    </div>
  )
}
