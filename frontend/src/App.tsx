import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DecisionTrace from './pages/DecisionTrace'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/decisions/:id" element={<DecisionTrace />} />
      </Routes>
    </BrowserRouter>
  )
}
