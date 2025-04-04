import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/screener" className="nav-link">
            Screener
          </Link>
          <Link to="/financial-options-lab" className="nav-link">
            Opciones
          </Link>
          <Link to="/consultas" className="nav-link">
            Consultas
          </Link>
          <Link to="/nosotros" className="nav-link">
            Legal
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
