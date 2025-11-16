import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AuthPage from './AuthPage'
import HomePage from './Pages/HomePage'
import AdminDashboard from './Pages/AdminDashboard'
import AddProduct from './Pages/AddProduct'
import HPSettings from './Pages/AdminHPSettings'
import './App.css'
import type { Session } from '@supabase/supabase-js'

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 1. Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Listen for auth state changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    // 3. Clean up the listener on component unmount
    return () => subscription.unsubscribe()
  }, [])

  // Helper function to handle logout
  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/dashboard" element={session ? <AdminDashboard /> : <AuthPage />} />
        <Route path="/admin/add-product" element={session ? <AddProduct /> : <AuthPage />} />
        <Route path="/admin/hp-settings" element={session ? <HPSettings /> : <AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
