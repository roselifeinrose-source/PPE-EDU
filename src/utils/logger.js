const DEBUG = import.meta.env.VITE_DEBUG === '1'

function ts() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

export const dbg = {
  info: (tag, msg, data) => {
    console.log(`%c${ts()}%c [${tag}] ${msg}`, 'color:gray', 'color:cyan;font-weight:bold', data ?? '')
  },
  ok: (tag, msg, data) => {
    console.log(`%c${ts()}%c [${tag}] ${msg}`, 'color:gray', 'color:green;font-weight:bold', data ?? '')
  },
  warn: (tag, msg, data) => {
    console.warn(`%c${ts()}%c [${tag}] ${msg}`, 'color:gray', 'color:orange;font-weight:bold', data ?? '')
  },
  err: (tag, msg, data) => {
    console.error(`%c${ts()}%c [${tag}] ${msg}`, 'color:gray', 'color:red;font-weight:bold', data ?? '')
  },
  debug: (tag, msg, data) => {
    if (!DEBUG) return
    console.log(`%c${ts()}%c [${tag}] ${msg}`, 'color:gray', 'color:magenta;font-weight:bold', data ?? '')
  },
}
