import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './styles/global.css'

import App            from './App'
import AdminPanel     from './components/Admin/AdminPanel'
import LocationDetail from './components/Detail/LocationDetail'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<App />} />
        <Route path="/admin"     element={<AdminPanel />} />
        <Route path="/lugar/:slug" element={<LocationDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)

