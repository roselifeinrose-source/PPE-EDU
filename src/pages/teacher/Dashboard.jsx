import { BookOpen, Users, TrendingUp } from 'lucide-react'
import useGameStore from '../../store/useGameStore'
import MetricCard from '../../components/MetricCard'
import GroupManager from '../../components/GroupManager'
import GlobalClassStats from '../../components/GlobalClassStats'

export default function TeacherDashboardPage() {
  const games = useGameStore((s) => s.games)
  const students = useGameStore((s) => s.students)

  const avgScore = games.length
    ? Math.round(games.reduce((sum, g) => sum + g.analytics.averageScore, 0) / games.length)
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tableau de Bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={BookOpen} label="Jeux Créés" value={games.length} color="indigo" />
        <MetricCard icon={Users} label="Élèves Actifs" value={students.length} color="emerald" />
        <MetricCard icon={TrendingUp} label="Score Moyen" value={`${avgScore}%`} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupManager />
        <GlobalClassStats />
      </div>
    </div>
  )
}
