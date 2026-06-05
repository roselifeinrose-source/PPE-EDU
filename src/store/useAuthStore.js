import { create } from 'zustand'

const useAuthStore = create((set) => ({
  role: 'teacher',
  currentStudentId: null,
  setTeacherView: () => set({ role: 'teacher', currentStudentId: null }),
  setStudentView: (studentId) => set({ role: 'student', currentStudentId: studentId }),
}))

export default useAuthStore
