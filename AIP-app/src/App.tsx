import HomePage from './Pages/HomePage'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AdminDashboard from './Pages/AdminDashboard'
import AddProduct from './Pages/AddProduct'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/admin/dashboard" className="nav-link">Admin</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/add-product" element={<AddProduct />} />
        </Routes>
      </div>
    </Router>
  )
}

// function HomePage() {
//   return (
//     <div className="home-page">
//       <h1>Welcome to Anything Is Possible Apparel</h1>
//       <p>Your one-stop shop for quality clothing</p>
//       <Link to="/admin" className="btn-link">
//         Go to Admin Panel
//       </Link>
//     </div>
//   )
// }

export default App
