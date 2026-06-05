import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import TeacherDashboard from './dashboards/TeacherDashboard'
import TeacherAnalytics from './dashboards/TeacherAnalytics'
import StudentDashboard from './dashboards/StudentDashboard'
import StudentLeaderboard from './dashboards/StudentLeaderboard'
import ChatBot from './components/ChatBot'
import useAuthStore from './store/useAuthStore'
import useTheme from './hooks/useTheme'

function HomeRedirect() {
  const role = useAuthStore((s) => s.role)
  if (role === 'teacher') return <Navigate to="/teacher" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  useTheme()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/leaderboard" element={<StudentLeaderboard />} />
          <Route path="/chat" element={<ChatBot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
