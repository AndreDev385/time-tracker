import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import './index.css'
import { SignInPage } from './pages/sign-in'
import { SessionPage } from './pages/session'
import { TasksPage } from './pages/tasks'
import { Toaster } from './components/shared/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
)
