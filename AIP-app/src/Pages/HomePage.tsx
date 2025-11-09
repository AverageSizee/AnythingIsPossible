import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../Component/Header'
import Footer from '../Component/Footer'

function HomePage() {
  return (
    <div>
      <Header />
      <h1>Welcome to the Homepage</h1>
      <p>This is the default page.</p>
      <Link to="/admin">
        <button>Go to Admin Page</button>
      </Link>
      <Footer />
    </div>
  )
}

export default HomePage
