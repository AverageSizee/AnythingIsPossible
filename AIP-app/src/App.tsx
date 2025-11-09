import HomePage from './Pages/HomePage'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AdminPage from './Pages/AdminPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
    <Router>
      <div className="app">
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  )
}

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Anything Is Possible Apparel</h1>
      <p>Your one-stop shop for quality clothing</p>
      <Link to="/admin" className="btn-link">
        Go to Admin Panel
      </Link>
    </div>
  )
}

export default App
