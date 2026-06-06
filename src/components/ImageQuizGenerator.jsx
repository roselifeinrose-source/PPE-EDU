import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, AlertTriangle, Check } from 'lucide-react'
import { GoogleGenAI } from '@google/genai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null

export default function ImageQuizGenerator({ onGenerated }) {
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setError(null)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const generate = async () => {
    if (!image) return
    if (!ai) {
      setError('Clé API Gemini manquante. Ajoutez VITE_GEMINI_API_KEY dans .env')
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result.split(',')[1])
        reader.readAsDataURL(image)
      })

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: image.type, data: base64Data } },
            { text: "Analyse cette image de cours ou de schéma informatique. Génère un quiz de 3 à 5 questions à choix multiples en français sur le contenu visible. Format JSON strict: {\"title\": \"titre du quiz\", \"topic\": \"sujet\", \"questions\": [{\"question\": \"texte\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correctIndex\": 0, \"concept\": \"concept\"}]}. Retourne UNIQUEMENT le JSON, rien d'autre." }
          ]
        }]
      })

      const text = typeof response.text === 'function' ? response.text() : response.text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Réponse IA invalide')
      const parsed = JSON.parse(jsonMatch[0])

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Format de questions invalide')
      }

      setResult(parsed)
    } catch (err) {
      setError(err.message || 'Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  const confirm = () => {
    if (!result) return
    onGenerated?.(result)
    setImage(null)
    setImagePreview(null)
    setResult(null)
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
        <Camera size={16} className="text-indigo-500" />
        Quiz depuis une Image
      </h3>

      {!imagePreview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Déposez une image ou cliquez pour importer</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG, WEBP</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img src={imagePreview} alt="Aperçu" className="w-full h-40 object-cover rounded-lg" />
            <button
              onClick={() => { setImage(null); setImagePreview(null); setResult(null) }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all text-xs"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {result.questions.length} questions générées
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{result.title} — {result.topic}</p>
            </div>
          )}

          <div className="flex gap-2">
            {result ? (
              <button
                onClick={confirm}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-all"
              >
                <Check size={14} /> Utiliser ce Quiz
              </button>
            ) : (
              <button
                onClick={generate}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 px-4 py-2 rounded-lg transition-all"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                {generating ? 'Analyse en cours...' : 'Générer le Quiz'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
