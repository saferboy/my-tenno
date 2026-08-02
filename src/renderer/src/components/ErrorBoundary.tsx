import { Component, type ReactNode } from 'react'
import { useUserProfileStore } from '../store/useUserProfileStore'
import { translations } from '../i18n/translations'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

// TDD 7.3: render vaqtidagi kutilmagan xatolar uchun chiroyli Error Modal -
// ilova to'liq "oq ekran"ga aylanib qolmasligi kerak.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render(): ReactNode {
    if (this.state.error) {
      const t = translations[useUserProfileStore.getState().locale]
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-10">
          <h1 className="font-display text-lg font-bold text-[var(--color-danger)]">
            {t['errorBoundary.title']}
          </h1>
          <p className="max-w-md text-center text-sm text-[var(--color-t2)]">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-[var(--color-tenno-gold)] px-4 py-2 text-sm font-semibold text-black"
          >
            {t['errorBoundary.reload']}
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
