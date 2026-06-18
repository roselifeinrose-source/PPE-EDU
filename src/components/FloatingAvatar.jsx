import { useState, useEffect, useRef, useCallback } from 'react'
import { animate } from 'animejs'
import Avatar from './Avatar'
import avatarEvents from '../utils/avatarEvents'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'

const PET_SIZE = 130
const WANDER_MIN = 4000
const WANDER_MAX = 10000
const REACTION_MS = 2800

const IDLE_MESSAGES = ['...', 'Zzz...', 'Prêt !', ' À toi !', '💪', '🎮']
const REACTION_MESSAGES = {
  correct: ['Bravo !', 'Super !', 'Génial !', 'Top !'],
  wrong: ['Hmm...', 'Presque !', 'Réessaie !'],
  levelup: ['Niveau supérieur !', 'Youpi !', 'Impressionnant !'],
  gamecomplete: ['Mission accomplie !', 'Bien joué !', 'Terminé !'],
  gamecomplete_bad: ['Continue !', 'Tu peux !', 'Pas grave !'],
  streak: ['Série en feu !', 'En feu !', '🔥🔥🔥'],
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function clampToScreen(x, y) {
  const maxX = window.innerWidth - PET_SIZE - 16
  const maxY = window.innerHeight - PET_SIZE - 80
  return {
    x: Math.max(16, Math.min(maxX, x)),
    y: Math.max(16, Math.min(maxY, y)),
  }
}

function randomPos() {
  const x = 32 + Math.random() * (window.innerWidth - PET_SIZE - 64)
  const y = window.innerHeight * 0.45 + Math.random() * (window.innerHeight * 0.35)
  return clampToScreen(x, y)
}

export default function FloatingAvatar() {
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const user = useAuthStore((s) => s.user)
  const students = useGameStore((s) => s.students)
  const student = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)
  const avatar = student?.avatar

  const containerRef = useRef(null)
  const [pos, setPos] = useState(randomPos)
  const [reaction, setReaction] = useState('idle')
  const [bubble, setBubble] = useState(null)
  const [facingRight, setFacingRight] = useState(true)
  const [isMoving, setIsMoving] = useState(false)
  const [moveDur, setMoveDur] = useState(3000)
  const [visible, setVisible] = useState(false)

  const wanderTimer = useRef(null)
  const reactionTimer = useRef(null)
  const bubbleTimer = useRef(null)
  const isReacting = useRef(false)
  const scheduleWanderRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  const prevStudentRef = useRef(currentStudentId)

  useEffect(() => {
    if (prevStudentRef.current !== currentStudentId) {
      prevStudentRef.current = currentStudentId
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 100)
      return () => clearTimeout(t)
    }
  }, [currentStudentId])

  const showBubble = useCallback((texts, duration) => {
    clearTimeout(bubbleTimer.current)
    setBubble(typeof texts === 'string' ? texts : pick(texts))
    bubbleTimer.current = setTimeout(() => setBubble(null), duration || 2200)
  }, [])

  const moveTo = useCallback((targetX, targetY, duration) => {
    const target = clampToScreen(targetX, targetY)
    const dur = duration || 3000

    setFacingRight((prev) => {
      if (target.x > pos.x) return true
      if (target.x < pos.x) return false
      return prev
    })

    setMoveDur(dur)
    setIsMoving(true)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPos(target)
      })
    })

    setTimeout(() => setIsMoving(false), dur)
  }, [pos.x])

  const scheduleWander = useCallback(() => {
    clearTimeout(wanderTimer.current)
    const delay = WANDER_MIN + Math.random() * (WANDER_MAX - WANDER_MIN)
    wanderTimer.current = setTimeout(() => {
      if (!isReacting.current) {
        const margin = PET_SIZE + 40
        const x = margin + Math.random() * (window.innerWidth - margin * 2)
        const y = margin + Math.random() * (window.innerHeight - margin * 2 - 80)
        const speed = 3000 + Math.random() * 2000
        moveTo(x, y, speed)
        if (Math.random() < 0.35) showBubble(pick(IDLE_MESSAGES), 1500)
        scheduleWanderRef.current?.()
      }
    }, delay)
  }, [moveTo, showBubble])

  useEffect(() => {
    scheduleWanderRef.current = scheduleWander
  }, [scheduleWander])

  const triggerReaction = useCallback((type, duration) => {
    isReacting.current = true
    clearTimeout(reactionTimer.current)
    clearTimeout(wanderTimer.current)

    const msgs = REACTION_MESSAGES[type]
    if (msgs) showBubble(msgs, duration || REACTION_MS)

    const reactionType = type === 'correct' ? 'happy' : type === 'wrong' ? 'sad' : 'win'
    setReaction(reactionType)

    const el = containerRef.current

    if (type === 'correct' && el) {
      animate(el, {
        translateY: [0, -40, 0],
        rotate: [0, -8, 8, 0],
        duration: 700,
        ease: 'outQuad',
      })
    } else if (type === 'wrong' && el) {
      animate(el, {
        translateX: [0, 15, -15, 10, -5, 0],
        duration: 500,
        ease: 'inOut(2)',
      })
    } else if ((type === 'levelup' || type === 'streak') && el) {
      const cx = window.innerWidth / 2 - PET_SIZE / 2
      const cy = window.innerHeight / 3
      setPos(clampToScreen(cx, cy))
      animate(el, {
        scale: [1, 1.3, 1],
        rotate: '1turn',
        duration: 1200,
        ease: 'outBack(1.4)',
      })
    }

    reactionTimer.current = setTimeout(() => {
      setReaction('idle')
      isReacting.current = false
      scheduleWanderRef.current?.()
    }, duration || REACTION_MS)
  }, [showBubble])

  useEffect(() => {
    const t = setTimeout(() => scheduleWanderRef.current?.(), 1200)
    return () => {
      clearTimeout(t)
      clearTimeout(wanderTimer.current)
      clearTimeout(reactionTimer.current)
      clearTimeout(bubbleTimer.current)
    }
  }, [])

  useEffect(() => {
    const unsubs = [
      avatarEvents.on('correct', () => triggerReaction('correct')),
      avatarEvents.on('wrong', () => triggerReaction('wrong')),
      avatarEvents.on('levelup', () => triggerReaction('levelup')),
      avatarEvents.on('gamecomplete', (score) => triggerReaction(score >= 60 ? 'gamecomplete' : 'gamecomplete_bad')),
      avatarEvents.on('streak', () => triggerReaction('streak')),
    ]
    return () => unsubs.forEach((fn) => fn())
  }, [triggerReaction])

  const handleClick = () => {
    if (isReacting.current) return
    const el = containerRef.current

    showBubble(['Salut !', 'On joue ?', '😅', 'Hey !', '🚀'], 2000)
    setReaction('happy')

    const margin = PET_SIZE + 40
    const x = margin + Math.random() * (window.innerWidth - margin * 2)
    const y = margin + Math.random() * (window.innerHeight - margin * 2 - 80)
    moveTo(x, y, 1200)

    if (el) {
      animate(el, {
        scale: [1, 1.15, 0.95, 1.05, 1],
        duration: 500,
        ease: 'outElastic(1, .4)',
      })
    }

    clearTimeout(reactionTimer.current)
    reactionTimer.current = setTimeout(() => setReaction('idle'), 1800)
  }

  const emoji = avatar?.emoji || '😊'
  const color = avatar?.color || 'from-slate-400 to-slate-600'

  return (
    <div className="pointer-events-none fixed inset-0" style={{ overflow: 'visible', zIndex: 9999 }} aria-hidden="true">
      <style>{`
        @keyframes shadow-pulse {
          0%, 100% { transform: scaleX(1); opacity: 0.2; }
          50% { transform: scaleX(0.7); opacity: 0.1; }
        }
        @keyframes bubble-pop {
          0%   { transform: scale(0) translateY(8px); opacity: 0; }
          60%  { transform: scale(1.1) translateY(-4px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        ref={containerRef}
        className="pointer-events-auto cursor-pointer select-none"
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: PET_SIZE,
          overflow: 'visible',
          transform: `scaleX(${facingRight ? 1 : -1})`,
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          scale: visible ? '1' : '0.5',
          transitionProperty: isMoving ? 'left, top, opacity, scale' : 'opacity, scale',
          transitionDuration: isMoving ? `${moveDur}ms, ${moveDur}ms, 300ms, 300ms` : '300ms, 300ms',
          transitionTimingFunction: isMoving ? 'ease-in-out, ease-in-out, ease-out, ease-out' : 'ease-out, ease-out',
        }}
        onClick={handleClick}
        title="Clique sur moi !"
      >
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-black/20"
          style={{
            width: 50,
            height: 10,
            animation: 'shadow-pulse 2.5s ease-in-out infinite',
          }}
        />

        {bubble && (
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600"
            style={{
              animation: 'bubble-pop 0.35s ease-out forwards',
              transform: `scaleX(${facingRight ? 1 : -1})`,
            }}
          >
            {bubble}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white dark:bg-slate-700 border-r border-b border-slate-200 dark:border-slate-600" />
          </div>
        )}

        <Avatar
          emoji={emoji}
          reaction={reaction}
          size={PET_SIZE}
          color={color}
        />
      </div>
    </div>
  )
}
