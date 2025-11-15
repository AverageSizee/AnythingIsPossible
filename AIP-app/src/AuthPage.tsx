'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { supabase } from './supabaseClient'

export default function AuthPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }

      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(isSignUp ? 'Account created! Check your email.' : 'Signed in successfully!')
        if (!isSignUp) {
          navigate('/admin/dashboard')
        }
        setEmail('')
        setPassword('')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-2xl font-bold tracking-tight">AIP</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md px-4">
          {/* Form Section */}
          <div className="space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-neutral-400 text-sm md:text-base">
                {isSignUp 
                  ? 'Join the community. Exclusive drops and early access await.' 
                  : 'Sign in to access your orders and exclusive content.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-medium tracking-wider text-neutral-300">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-4 py-3 pl-10 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-xs font-medium tracking-wider text-neutral-300">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-4 py-3 pl-10 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-neutral-900 border border-red-900/50 rounded p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-neutral-900 border border-green-900/50 rounded p-3">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3 px-4 rounded hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="border-t border-neutral-800 pt-6">
              <p className="text-center text-neutral-400 text-sm">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                    setSuccess('')
                  }}
                  className="text-white font-medium hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
            <p>&copy; 2025 BRAND. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
