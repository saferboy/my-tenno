import { Component, type ReactNode } from 'react'

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
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-10">
          <h1 className="text-lg font-bold text-red-400">Kutilmagan xatolik yuz berdi</h1>
          <p className="max-w-md text-center text-sm text-[var(--orokin-text-dim)]">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="chamfer bg-[var(--orokin-gold)] px-4 py-2 text-sm font-semibold text-black"
          >
            Qayta yuklash
          </button>
        </main>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
