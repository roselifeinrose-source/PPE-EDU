import Leaderboard from '../components/Leaderboard'
import InterGroupLeaderboard from '../components/InterGroupLeaderboard'

export default function StudentLeaderboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Classements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Leaderboard />
        <InterGroupLeaderboard />
      </div>
    </div>
  )
}
