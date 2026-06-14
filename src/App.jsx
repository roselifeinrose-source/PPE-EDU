import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import TeacherLayout from './layouts/TeacherLayout'
import StudentLayout from './layouts/StudentLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import TeacherDashboardPage from './pages/teacher/Dashboard'
import TeacherGamesPage from './pages/teacher/Games'
import TeacherCreatePage from './pages/teacher/CreateGame'
import TeacherAnalyticsPage from './pages/teacher/Analytics'
import TeacherGroupsPage from './pages/teacher/Groups'
import StudentDashboard from './dashboards/StudentDashboard'
import StudentLeaderboard from './dashboards/StudentLeaderboard'
import StudentProfile from './components/StudentProfile'
import ChatBot from './components/ChatBot'
import LoginPage from './pages/auth/LoginPage'
import useAuthStore from './store/useAuthStore'
import useGameStore from './store/useGameStore'
import useTheme from './hooks/useTheme'

function HomeRedirect() {
  const role = useAuthStore((s) => s.role)
  if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />
  if (role === 'student') return <Navigate to="/dashboard" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  useTheme()
  const init = useAuthStore((s) => s.init)
  const syncFromAPI = useGameStore((s) => s.syncFromAPI)

  useEffect(() => {
    init()
    syncFromAPI()
  }, [init, syncFromAPI])

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Teacher routes with sidebar layout */}
          <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboardPage />} />
            <Route path="games" element={<TeacherGamesPage />} />
            <Route path="create" element={<TeacherCreatePage />} />
            <Route path="analytics" element={<TeacherAnalyticsPage />} />
            <Route path="groups" element={<TeacherGroupsPage />} />
          </Route>

          {/* Student routes with sidebar layout */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
          </Route>
          <Route path="/leaderboard" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentLeaderboard />} />
          </Route>
          <Route path="/profile" element={<ProtectedRoute allowedRole="student"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentProfile />} />
          </Route>

          {/* Chat — no sidebar */}
          <Route element={<MainLayout />}>
            <Route path="/chat" element={<ChatBot />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
