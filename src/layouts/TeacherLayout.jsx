import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import TeacherSidebar from '../components/TeacherSidebar'
import SettingsModal from '../components/SettingsModal'

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('teacher_sidebar_collapsed') === 'true')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const toggleSidebar = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('teacher_sidebar_collapsed', String(next))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <div className="flex">
        <TeacherSidebar collapsed={collapsed} onToggle={toggleSidebar} onSettings={() => setSettingsOpen(true)} />
        <main className={`flex-1 p-2 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-56'}`}>
          {/* <div className="h-[calc(100vh-4rem)] overflow-y-auto"> */}
          <Outlet />
          {/* </div> */}
        </main>
      </div>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
