import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import FloatingAvatar from './FloatingAvatar'
import useAuthStore from '../store/useAuthStore'

export default function MainLayout() {
  const role = useAuthStore((s) => s.role)
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const [transitionKey, setTransitionKey] = useState(0)
  const prevStudentRef = useRef(currentStudentId)

  useEffect(() => {
    if (role === 'student' && prevStudentRef.current !== currentStudentId) {
      prevStudentRef.current = currentStudentId
      const t = setTimeout(() => setTransitionKey((k) => k + 1), 200)
      return () => clearTimeout(t)
    }
  }, [currentStudentId, role])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto" key={transitionKey}>
        <Outlet />
      </main>
      {role === 'student' && <FloatingAvatar />}
    </div>
  )
}
