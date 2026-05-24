import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Entry from './components/Entry'
import Desktop from './components/Desktop'

function ProtectedDesktop() {
  const entered = sessionStorage.getItem('entered') === '1'
  if (!entered) return <Navigate to="/" replace />
  return <Desktop />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/home" element={<ProtectedDesktop />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
