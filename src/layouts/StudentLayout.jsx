import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StudentSidebar from '../components/StudentSidebar'
import FloatingAvatar from '../components/FloatingAvatar'
import useAuthStore from '../store/useAuthStore'

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('student_sidebar_collapsed') === 'true')
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const [transitionKey, setTransitionKey] = useState(0)
  const prevStudentRef = useRef(currentStudentId)

  useEffect(() => {
    if (prevStudentRef.current !== currentStudentId) {
      prevStudentRef.current = currentStudentId
      const t = setTimeout(() => setTransitionKey((k) => k + 1), 200)
      return () => clearTimeout(t)
    }
  }, [currentStudentId])

  const toggleSidebar = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('student_sidebar_collapsed', String(next))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="flex">
        <StudentSidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <main className={`flex-1 p-2 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-56'}`} key={transitionKey}>
          <Outlet />
        </main>
      </div>
      <FloatingAvatar />
    </div>
  )
}
