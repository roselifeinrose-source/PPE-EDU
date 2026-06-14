import { memo } from 'react'

const BODY_COLORS = {
  'from-indigo-500 to-purple-500': { main: '#6366f1', accent: '#a855f7' },
  'from-emerald-400 to-teal-600': { main: '#34d399', accent: '#0d9488' },
  'from-pink-500 to-rose-500': { main: '#ec4899', accent: '#f43f5e' },
  'from-amber-400 to-orange-500': { main: '#fbbf24', accent: '#f97316' },
  'from-violet-500 to-fuchsia-500': { main: '#8b5cf6', accent: '#d946ef' },
  'from-cyan-400 to-blue-600': { main: '#22d3ee', accent: '#2563eb' },
  'from-slate-400 to-slate-600': { main: '#94a3b8', accent: '#475569' },
}

function getColors(colorClass) {
  return BODY_COLORS[colorClass] || BODY_COLORS['from-slate-400 to-slate-600']
}

function RobotSVG({ reaction, colorClass }) {
  const colors = getColors(colorClass)

  const eyes = {
    idle: (
      <>
        <circle cx="35" cy="42" r="5" fill="#1e293b" />
        <circle cx="65" cy="42" r="5" fill="#1e293b" />
        <circle cx="37" cy="40" r="1.5" fill="white" />
        <circle cx="67" cy="40" r="1.5" fill="white" />
      </>
    ),
    happy: (
      <>
        <path d="M29 42 Q35 36 41 42" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M59 42 Q65 36 71 42" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
    sad: (
      <>
        <circle cx="35" cy="44" r="5" fill="#1e293b" />
        <circle cx="65" cy="44" r="5" fill="#1e293b" />
        <circle cx="33" cy="47" r="3" fill="#93c5fd" opacity="0.6" />
        <circle cx="63" cy="47" r="3" fill="#93c5fd" opacity="0.6" />
      </>
    ),
    win: (
      <>
        <text x="35" y="46" textAnchor="middle" fontSize="14">⭐</text>
        <text x="65" y="46" textAnchor="middle" fontSize="14">⭐</text>
      </>
    ),
  }

  const mouth = {
    idle: <path d="M42 56 Q50 62 58 56" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    happy: <path d="M38 54 Q50 68 62 54" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    sad: <path d="M42 62 Q50 55 58 62" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    win: <path d="M36 52 Q50 70 64 52" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />,
  }

  const currentReaction = reaction === 'win' ? 'win' : reaction

  return (
    <svg viewBox="0 0 100 110" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="petBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.accent} />
        </linearGradient>
        <filter id="petShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
        </filter>
      </defs>

      <style>{`
        @keyframes arm-wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        @keyframes arm-wave-fast {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-30deg); }
          75% { transform: rotate(30deg); }
        }
        @keyframes arm-pump {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(-20deg) translateY(-3px); }
        }
        @keyframes arm-droop {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
      `}</style>

      {/* Antenna */}
      <line x1="50" y1="12" x2="50" y2="4" stroke={colors.accent} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="50" cy="3" r="3" fill={reaction === 'win' ? '#fbbf24' : colors.accent} />

      {/* Head */}
      <rect x="22" y="14" width="56" height="46" rx="14" fill="url(#petBodyGrad)" filter="url(#petShadow)" />

      {/* Face screen */}
      <rect x="27" y="20" width="46" height="34" rx="8" fill="#e2e8f0" />

      {/* Eyes + Mouth */}
      {eyes[currentReaction] || eyes.idle}
      {mouth[currentReaction] || mouth.idle}

      {/* Ears */}
      <rect x="14" y="28" width="8" height="16" rx="3" fill={colors.accent} />
      <rect x="78" y="28" width="8" height="16" rx="3" fill={colors.accent} />

      {/* Body */}
      <rect x="28" y="62" width="44" height="28" rx="8" fill="url(#petBodyGrad)" filter="url(#petShadow)" />

      {/* Chest light */}
      <circle cx="50" cy="74" r="4" fill="white" opacity="0.9" />
      <circle cx="50" cy="74" r="2.5" fill={reaction === 'happy' || reaction === 'win' ? '#22c55e' : reaction === 'sad' ? '#ef4444' : '#60a5fa'} />

      {/* Left Arm */}
      <g style={{
        transformOrigin: '22px 67px',
        animation: reaction === 'happy'
          ? 'arm-wave-fast 0.4s ease-in-out infinite'
          : reaction === 'win'
            ? 'arm-pump 0.5s ease-in-out infinite'
            : reaction === 'sad'
              ? 'arm-droop 2s ease-in-out infinite'
              : 'arm-wave 1.5s ease-in-out infinite',
      }}>
        <rect x="8" y="64" width="14" height="6" rx="3" fill={colors.accent} />
        <circle cx="8" cy="67" r="3.5" fill={colors.main} />
      </g>

      {/* Right Arm */}
      <g style={{
        transformOrigin: '78px 67px',
        animation: reaction === 'happy'
          ? 'arm-wave-fast 0.4s ease-in-out infinite 0.1s'
          : reaction === 'win'
            ? 'arm-pump 0.5s ease-in-out infinite 0.15s'
            : reaction === 'sad'
              ? 'arm-droop 2s ease-in-out infinite 0.3s'
              : 'arm-wave 1.5s ease-in-out infinite 0.2s',
      }}>
        <rect x="78" y="64" width="14" height="6" rx="3" fill={colors.accent} />
        <circle cx="92" cy="67" r="3.5" fill={colors.main} />
      </g>

      {/* Legs */}
      <rect x="35" y="90" width="10" height="12" rx="4" fill={colors.accent} />
      <rect x="55" y="90" width="10" height="12" rx="4" fill={colors.accent} />

      {/* Feet */}
      <rect x="32" y="98" width="16" height="6" rx="3" fill={colors.main} />
      <rect x="52" y="98" width="16" height="6" rx="3" fill={colors.main} />
    </svg>
  )
}

export default memo(function Avatar({ emoji = '😊', reaction = 'idle', size = 100, color = 'from-slate-400 to-slate-600' }) {
  return (
    <div className="relative" style={{ width: size, height: size * 1.1 }}>
      <RobotSVG reaction={reaction} colorClass={color} />
      <div
        className="absolute text-xs font-bold"
        style={{ top: '62%', left: '50%', transform: 'translateX(-50%)', fontSize: size * 0.14 }}
      >
        {emoji}
      </div>
    </div>
  )
})
