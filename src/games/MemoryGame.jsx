import { useState, useCallback, useMemo } from 'react'
import { ArrowLeft, RefreshCw, HelpCircle, Zap } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'
import avatarEvents from '../utils/avatarEvents'

// Helper to shuffle array
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function MemoryGame({ game, onBack }) {
  const submitGameResult = useGameStore((s) => s.submitGameResult)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)

  const pairs = useMemo(() => game.content?.pairs || [], [game.content])

  const buildCards = useCallback(() => {
    if (pairs.length === 0) return []
    const originalPairs = pairs.slice(0, 6)
    const cardList = []
    originalPairs.forEach((p) => {
      cardList.push({
        id: p.id + '_left',
        label: p.left,
        isDefinition: false,
        pairId: p.id,
        isFlipped: false,
        isMatched: false,
      })
      cardList.push({
        id: p.id + '_right',
        label: p.right,
        isDefinition: true,
        pairId: p.id,
        isFlipped: false,
        isMatched: false,
      })
    })
    return shuffle(cardList)
  }, [pairs])

  const [cards, setCards] = useState(() => buildCards())
  const [selected, setSelected] = useState([])
  const [moves, setMoves] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [busy, setBusy] = useState(false)

  const initGame = useCallback(() => {
    setCards(buildCards())
    setSelected([])
    setMoves(0)
    setMatchedCount(0)
    setFinished(false)
    setHintsLeft(3)
    setBusy(false)
  }, [buildCards])

  const handleCardClick = (index) => {
    if (busy || finished) return
    const card = cards[index]
    if (card.isFlipped || card.isMatched) return

    playSound.click()

    // Flip card
    const updatedCards = [...cards]
    updatedCards[index] = { ...card, isFlipped: true }
    setCards(updatedCards)

    const nextSelected = [...selected, index]
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      setBusy(true)
      setMoves((m) => m + 1)
      const firstIdx = nextSelected[0]
      const secondIdx = nextSelected[1]
      const firstCard = cards[firstIdx]
      const secondCard = cards[secondIdx]

      // Check match
      if (firstCard.pairId === secondCard.pairId && firstCard.isDefinition !== secondCard.isDefinition) {
        // MATCH
        setTimeout(() => {
          playSound.correct()
          avatarEvents.emit('correct')
          const matchedCards = [...updatedCards]
          matchedCards[firstIdx] = { ...firstCard, isFlipped: true, isMatched: true }
          matchedCards[secondIdx] = { ...secondCard, isFlipped: true, isMatched: true }
          setCards(matchedCards)
          setSelected([])
          setBusy(false)

          const newMatched = matchedCount + 1
          setMatchedCount(newMatched)

          if (newMatched === originalPairsLength()) {
            endGame(moves + 1)
          }
        }, 500)
      } else {
        // MISMATCH
        setTimeout(() => {
          playSound.incorrect()
          avatarEvents.emit('wrong')
          const resetCards = [...updatedCards]
          resetCards[firstIdx] = { ...firstCard, isFlipped: false }
          resetCards[secondIdx] = { ...secondCard, isFlipped: false }
          setCards(resetCards)
          setSelected([])
          setBusy(false)
        }, 1000)
      }
    }
  }

  const originalPairsLength = () => {
    return Math.min(6, pairs.length)
  }

  const useHint = () => {
    if (hintsLeft <= 0 || busy || finished) return
    playSound.click()

    // Find first unmatched pair
    const unmatched = cards.find(c => !c.isMatched)
    if (!unmatched) return

    const pairId = unmatched.pairId
    const pairCardsIndices = cards
      .map((c, i) => (c.pairId === pairId ? i : -1))
      .filter((idx) => idx !== -1)

    setBusy(true)
    setHintsLeft((h) => h - 1)

    // Temporarily flip the pair
    const tempCards = [...cards]
    pairCardsIndices.forEach((idx) => {
      tempCards[idx] = { ...tempCards[idx], isFlipped: true }
    })
    setCards(tempCards)

    setTimeout(() => {
      // Flip back if not matched in the meantime
      const finalCards = [...cards]
      pairCardsIndices.forEach((idx) => {
        if (!finalCards[idx].isMatched) {
          finalCards[idx] = { ...finalCards[idx], isFlipped: false }
        }
      })
      setCards(finalCards)
      setBusy(false)
    }, 1200)
  }

  const endGame = (finalMoves) => {
    setFinished(true)
    playSound.levelUp()

    const pairsCount = originalPairsLength()
    // Optimal moves is pairsCount. Calculate score based on efficiency.
    const score = Math.max(20, Math.round((pairsCount / finalMoves) * 100))
    const xp = Math.round((score / 100) * 50)

    if (currentStudentId) {
      submitGameResult(currentStudentId, game.id, score, xp)
    }
  }

  const pairsCount = originalPairsLength()
  const score = finished ? Math.max(20, Math.round((pairsCount / moves) * 100)) : 0
  const xpGained = Math.round((score / 100) * 50)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <style>{`
        .perspective-grid {
          perspective: 1000px;
        }
        .card-inner {
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-flipped {
          transform: rotateY(180deg);
        }
        .backface-hide {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Header bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <ArrowLeft size={16} /> Retour
        </button>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-none">{game.title}</h2>
        <button onClick={initGame} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all" title="Recommencer">
          <RefreshCw size={15} />
        </button>
      </div>

      {!finished ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Status indicators */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Tentatives</span>
              <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{moves}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Associations</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{matchedCount} / {pairsCount}</span>
            </div>
            <button
              onClick={useHint}
              disabled={hintsLeft <= 0 || busy}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 disabled:opacity-50 disabled:hover:border-slate-200 rounded-xl p-3 text-center cursor-pointer transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5 flex items-center justify-center gap-1">
                <HelpCircle size={10} /> Indices
              </span>
              <span className="text-lg font-extrabold text-amber-500">{hintsLeft}</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 perspective-grid">
            {cards.map((card, i) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(i)}
                className="w-full aspect-[4/5] cursor-pointer"
              >
                <div className={`relative w-full h-full card-inner ${card.isFlipped ? 'card-flipped' : ''}`}>
                  {/* Card Front (Back of card before flipped) */}
                  <div className="absolute inset-0 backface-hide bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md border border-indigo-400/20 flex flex-col items-center justify-center p-3 select-none">
                    <div className="text-2xl mb-1 filter drop-shadow-sm">🧠</div>
                    <span className="text-[9px] font-bold tracking-wider opacity-60 uppercase">InforGames</span>
                  </div>

                  {/* Card Back (Content of card when flipped) */}
                  <div className={`absolute inset-0 backface-hide rotate-y-180 bg-white dark:bg-slate-900 border-2 ${
                    card.isMatched ? 'border-emerald-400 dark:border-emerald-800/80 bg-emerald-50/20' : 'border-indigo-100 dark:border-slate-700'
                  } rounded-xl shadow-md flex items-center justify-center p-3 text-center select-none overflow-hidden`}>
                    <p className={`text-[10px] font-semibold leading-relaxed ${
                      card.isMatched ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {card.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Victory Screen */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center space-y-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-5xl filter drop-shadow-md">🏆</div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Bravo, mission accomplie !</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vous avez retrouvé toutes les paires informatiques.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Tentatives</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{moves}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Efficacité</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{score}%</span>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-950/40 rounded-xl p-4 flex items-center justify-center gap-2">
            <Zap size={18} className="text-indigo-500 fill-indigo-500" />
            <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">+{xpGained} XP gagnés !</span>
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
      )}
    </div>
  )
}
