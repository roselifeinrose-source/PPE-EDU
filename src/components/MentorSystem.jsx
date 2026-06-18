import { useState } from 'react'
import { Users, ArrowRight, Zap, Star, X, GraduationCap, Award } from 'lucide-react'
import useGameStore from '../store/useGameStore'
import useAuthStore from '../store/useAuthStore'
import { playSound } from '../utils/soundService'
import { getLevel } from '../constants'

export default function MentorSystem({ onClose }) {
  const students = useGameStore((s) => s.students)
  const setMentorPairing = useGameStore((s) => s.setMentorPairing)
  const removeMentorPairing = useGameStore((s) => s.removeMentorPairing)
  const mentorPairs = useGameStore((s) => s.mentorPairs ?? [])
  const currentStudentId = useAuthStore((s) => s.currentStudentId)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [selectedMentee, setSelectedMentee] = useState(null)

  const user = useAuthStore((s) => s.user)
  const currentStudent = students.find((s) => s.id === currentStudentId) || (user?.id === currentStudentId ? user : null)
  const highLevelStudents = students.filter((s) => getLevel(s.totalXP) >= 5).sort((a, b) => getLevel(b.totalXP) - getLevel(a.totalXP))
  const lowLevelStudents = students.filter((s) => getLevel(s.totalXP) < 5).sort((a, b) => getLevel(a.totalXP) - getLevel(b.totalXP))

  const myPair = mentorPairs.find((p) => p.mentorId === currentStudentId || p.menteeId === currentStudentId)

  const handlePair = () => {
    if (!selectedMentor || !selectedMentee) return
    playSound.correct()
    setMentorPairing(selectedMentor, selectedMentee)
    setSelectedMentor(null)
    setSelectedMentee(null)
  }

  const handleRemovePair = (mentorId) => {
    playSound.click()
    removeMentorPairing(mentorId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Système de Mentorat</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {myPair && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                {myPair.mentorId === currentStudentId ? '🎯 Vous êtes mentor de :' : '📖 Votre mentor est :'}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{students.find((s) => s.id === myPair.mentorId)?.avatar?.emoji || '👤'}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {students.find((s) => s.id === myPair.mentorId)?.name}
                  </span>
                </div>
                <ArrowRight size={14} className="text-indigo-400" />
                <div className="flex items-center gap-2">
                  <span className="text-lg">{students.find((s) => s.id === myPair.menteeId)?.avatar?.emoji || '👤'}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {students.find((s) => s.id === myPair.menteeId)?.name}
                  </span>
                </div>
                <button onClick={() => handleRemovePair(myPair.mentorId)} className="ml-auto text-xs text-red-500 hover:text-red-700 transition-colors">
                  Dissoudre
                </button>
              </div>
            </div>
          )}

          {currentStudent && getLevel(currentStudent.totalXP) >= 5 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Créer un pairing</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 mb-2">Mentor (Niv. 5+)</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {highLevelStudents.map((s) => (
                      <button key={s.id} onClick={() => setSelectedMentor(s.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-150 ${
                          selectedMentor === s.id
                            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}>
                        <span className="text-sm">{s.avatar?.emoji || '👤'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400">Niv. {getLevel(s.totalXP)} · {s.totalXP} XP</p>
                        </div>
                        <Star size={10} className="text-amber-400 shrink-0" />
                      </button>
                    ))}
                    {highLevelStudents.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3">Aucun élève niveau 5+</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 mb-2">Mentee (Niv. 1-4)</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {lowLevelStudents.map((s) => {
                      const isPaired = mentorPairs.some((p) => p.menteeId === s.id)
                      return (
                        <button key={s.id} onClick={() => !isPaired && setSelectedMentee(s.id)} disabled={isPaired}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-150 ${
                            isPaired ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700'
                            : selectedMentee === s.id
                              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}>
                          <span className="text-sm">{s.avatar?.emoji || '👤'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{s.name}</p>
                            <p className="text-[10px] text-slate-400">Niv. {getLevel(s.totalXP)}</p>
                          </div>
                          {isPaired && <Award size={10} className="text-emerald-400 shrink-0" />}
                        </button>
                      )
                    })}
                    {lowLevelStudents.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3">Aucun élève niveau 1-4</p>
                    )}
                  </div>
                </div>
              </div>
              {selectedMentor && selectedMentee && (
                <button onClick={handlePair}
                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  <Users size={14} /> Créer le pairing
                </button>
              )}
            </div>
          )}

          {currentStudent && getLevel(currentStudent.totalXP) < 5 && !myPair && (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Atteignez le niveau 5 pour devenir mentor !</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Continuez à jouer pour monter en niveau.</p>
            </div>
          )}

          {mentorPairs.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Pairings actifs ({mentorPairs.length})</h3>
              <div className="space-y-2">
                {mentorPairs.map((pair, i) => {
                  const mentor = students.find((s) => s.id === pair.mentorId)
                  const mentee = students.find((s) => s.id === pair.menteeId)
                  return (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                      <span className="text-lg">{mentor?.avatar?.emoji || '👤'}</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{mentor?.name}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className="text-lg">{mentee?.avatar?.emoji || '👤'}</span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{mentee?.name}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <Zap size={10} className="text-indigo-400" />
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400">+5 XP/jeu</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
