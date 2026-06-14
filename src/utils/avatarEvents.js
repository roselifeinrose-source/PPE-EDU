const listeners = {}

const avatarEvents = {
  emit(type, data) {
    (listeners[type] || []).forEach((fn) => fn(data))
  },
  on(type, fn) {
    if (!listeners[type]) listeners[type] = []
    listeners[type].push(fn)
    return () => {
      listeners[type] = listeners[type].filter((f) => f !== fn)
    }
  },
}

export default avatarEvents
