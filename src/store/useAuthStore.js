import { create } from 'zustand'
import { authAPI } from '../api/apiService'
import { dbg } from '../utils/logger'

const useAuthStore = create((set) => ({
  role: null,
  currentStudentId: null,
  user: null,
  token: null,
  loading: true,

  init: () => {
    const token = localStorage.getItem('ppe-token')
    const role = localStorage.getItem('ppe-role')
    const user = localStorage.getItem('ppe-user')
    dbg.debug('AUTH', 'init', { token: !!token, role })
    if (token && role) {
      set({
        token,
        role,
        user: user ? JSON.parse(user) : null,
        currentStudentId: role === 'student' ? JSON.parse(user)?.id : null,
        loading: false,
      })
    } else {
      set({ loading: false })
    }
  },

  loginTeacher: async (email, password) => {
    dbg.info('AUTH', 'loginTeacher', { email })
    const { token, teacher } = await authAPI.login(email, password)
    dbg.ok('AUTH', 'loginTeacher success', { id: teacher.id, name: teacher.name })
    localStorage.setItem('ppe-token', token)
    localStorage.setItem('ppe-role', 'teacher')
    localStorage.setItem('ppe-user', JSON.stringify(teacher))
    set({ token, role: 'teacher', user: teacher, currentStudentId: null })
  },

  loginStudent: async (studentId) => {
    dbg.info('AUTH', 'loginStudent', { studentId })
    const { token, student } = await authAPI.loginStudent(studentId)
    dbg.ok('AUTH', 'loginStudent success', { id: student.id, name: student.name })
    localStorage.setItem('ppe-token', token)
    localStorage.setItem('ppe-role', 'student')
    localStorage.setItem('ppe-user', JSON.stringify(student))
    set({ token, role: 'student', user: student, currentStudentId: student.id })
  },

  loginStudentByName: async (name) => {
    dbg.info('AUTH', 'loginStudentByName', { name })
    const { token, student } = await authAPI.loginStudentByName(name)
    dbg.ok('AUTH', 'loginStudentByName success', { id: student.id, name: student.name })
    localStorage.setItem('ppe-token', token)
    localStorage.setItem('ppe-role', 'student')
    localStorage.setItem('ppe-user', JSON.stringify(student))
    set({ token, role: 'student', user: student, currentStudentId: student.id })
  },

  signup: async (data) => {
    dbg.info('AUTH', 'signup', { name: data.name, email: data.email })
    const { token, teacher } = await authAPI.signup(data)
    dbg.ok('AUTH', 'signup success', { id: teacher.id, name: teacher.name })
    localStorage.setItem('ppe-token', token)
    localStorage.setItem('ppe-role', 'teacher')
    localStorage.setItem('ppe-user', JSON.stringify(teacher))
    set({ token, role: 'teacher', user: teacher, currentStudentId: null })
  },

  logout: () => {
    dbg.info('AUTH', 'logout')
    localStorage.removeItem('ppe-token')
    localStorage.removeItem('ppe-role')
    localStorage.removeItem('ppe-user')
    set({ token: null, role: null, user: null, currentStudentId: null })
  },

  setStudentView: (studentId) => {
    dbg.info('AUTH', 'setStudentView', { studentId })
    set({ role: 'student', currentStudentId: studentId })
    localStorage.setItem('ppe-role', 'student')
  },

  setTeacherView: () => {
    dbg.info('AUTH', 'setTeacherView')
    set({ role: 'teacher', currentStudentId: null })
    localStorage.setItem('ppe-role', 'teacher')
  },
}))

export default useAuthStore
