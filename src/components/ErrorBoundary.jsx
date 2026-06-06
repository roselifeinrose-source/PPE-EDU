import { Component } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 max-w-md w-full text-center">
            <AlertTriangle size={40} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {this.state.error?.message || 'Le composant a planté de manière inattendue.'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Essayez de rafraîchir la page ou revenez à l'accueil.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <RefreshCcw size={14} /> Rafraîchir
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Accueil
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
