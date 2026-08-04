import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Overlay from './Overlay'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import UpdateBanner from './components/UpdateBanner'
import WhatsNewModal from './components/WhatsNewModal'

const isOverlay = new URLSearchParams(window.location.search).get('view') === 'overlay'
if (isOverlay) {
  document.body.classList.add('overlay-mode')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isOverlay ? (
        <Overlay />
      ) : (
        <>
          <App />
          <Toast />
          <UpdateBanner />
          <WhatsNewModal />
        </>
      )}
    </ErrorBoundary>
  </StrictMode>
)
