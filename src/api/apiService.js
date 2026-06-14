import { dbg } from '../utils/logger'

const API_URL = 'http://localhost:3001/api'

function getToken() {
  return localStorage.getItem('ppe-token')
}

function headers(auth = true) {
  const h = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) h['Authorization'] = `Bearer ${token}`
  }
  return h
}

async function request(path, options = {}) {
  dbg.debug('API', `${options.method || 'GET'} ${path}`)
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { ...headers(options.auth !== false), ...options.headers },
    })
  } catch {
    dbg.err('API', `Network error: ${path}`)
    throw new Error('Le serveur ne répond pas. Vérifiez que le backend est lancé (npm run dev:server)')
  }
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    dbg.err('API', `Invalid JSON response (HTTP ${res.status}): ${path}`)
    throw new Error(`Réponse inattendue du serveur (HTTP ${res.status}). Le serveur backend est-il lancé ?`)
  }
  if (!res.ok) {
    dbg.err('API', `HTTP ${res.status}: ${path}`, data)
    throw new Error(data.error || 'Erreur serveur')
  }
  dbg.ok('API', `HTTP ${res.status}: ${path}`)
  return data
}

export const authAPI = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  loginStudent: (studentId) => request('/auth/login', { method: 'POST', body: JSON.stringify({ role: 'student', studentId }) }),
  loginStudentByName: (name) => request('/auth/login', { method: 'POST', body: JSON.stringify({ role: 'student', name }) }),
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
}

export const teacherAPI = {
  getMe: () => request('/teachers/me'),
  updateMe: (data) => request('/teachers/me', { method: 'PUT', body: JSON.stringify(data) }),
}

export const studentAPI = {
  getAll: () => request('/students'),
  getById: (id) => request(`/students/${id}`),
  create: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/students/${id}`, { method: 'DELETE' }),
  addGroup: (data) => request('/students/groups', { method: 'POST', body: JSON.stringify(data) }),
  removeGroup: (id) => request(`/students/groups/${id}`, { method: 'DELETE' }),
}

export const gameAPI = {
  getAll: () => request('/games'),
  getById: (id) => request(`/games/${id}`),
  create: (data) => request('/games', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/games/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/games/${id}`, { method: 'DELETE' }),
  submitResult: (id, score, xpGained) => request(`/games/${id}/result`, { method: 'POST', body: JSON.stringify({ score, xpGained }) }),
}
