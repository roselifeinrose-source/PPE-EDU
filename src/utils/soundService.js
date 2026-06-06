// Web Audio API Sound Effects Synthesizer
// Self-contained sound engine with no external audio file requirements

let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const playSound = {
  click: () => {
    try {
      const ctx = getAudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.05)

      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch (e) {
      console.warn('Audio failed to play', e)
    }
  },

  correct: () => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      // First note
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'triangle'
      osc1.frequency.setValueAtTime(523.25, now) // C5
      gain1.gain.setValueAtTime(0.15, now)
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.15)

      // Second note
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(659.25, now + 0.1) // E5
      gain2.gain.setValueAtTime(0.15, now + 0.1)
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.1)
      osc2.stop(now + 0.3)
    } catch (e) {
      console.warn('Audio failed to play', e)
    }
  },

  incorrect: () => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.linearRampToValueAtTime(70, now + 0.25)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.25)
    } catch (e) {
      console.warn('Audio failed to play', e)
    }
  },

  levelUp: () => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50] // C4, E4, G4, C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + index * 0.08)
        
        gain.gain.setValueAtTime(0.1, now + index * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.2)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + index * 0.08)
        osc.stop(now + index * 0.08 + 0.2)
      })
    } catch (e) {
      console.warn('Audio failed to play', e)
    }
  }
}
