import Leaderboard from '../components/Leaderboard'

export default function StudentLeaderboard() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Classement</h1>
      <Leaderboard />
    </div>
  )
}
