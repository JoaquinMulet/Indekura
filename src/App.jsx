
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Screener from './pages/Screener'
import Consultas from './pages/Consultas'
import Nosotros from './pages/Nosotros'
import HistoricalValuation from './pages/HistoricalValuation'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/historical-valuation" element={<HistoricalValuation />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
