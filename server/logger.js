const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

export const log = {
  info: (tag, msg, data) => {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.cyan}[${tag}]${COLORS.reset}`
    console.log(`${prefix} ${msg}`, data !== undefined ? data : '')
  },
  ok: (tag, msg, data) => {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.green}[${tag}]${COLORS.reset}`
    console.log(`${prefix} ${msg}`, data !== undefined ? data : '')
  },
  warn: (tag, msg, data) => {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.yellow}[${tag}]${COLORS.reset}`
    console.warn(`${prefix} ${msg}`, data !== undefined ? data : '')
  },
  err: (tag, msg, data) => {
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.red}[${tag}]${COLORS.reset}`
    console.error(`${prefix} ${msg}`, data !== undefined ? data : '')
  },
  debug: (tag, msg, data) => {
    if (process.env.DEBUG !== '1') return
    const prefix = `${COLORS.gray}${timestamp()}${COLORS.reset} ${COLORS.magenta}[${tag}]${COLORS.reset}`
    console.log(`${prefix} ${msg}`, data !== undefined ? data : '')
  },
}
