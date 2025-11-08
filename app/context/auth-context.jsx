"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage?.getItem("workzen_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage?.setItem("workzen_user", JSON.stringify(userData))
    // Set cookie for server-side auth
    document.cookie = `user=${JSON.stringify(userData)}; path=/`
  }

  const logout = () => {
    setUser(null)
    localStorage?.removeItem("workzen_user")
    // Clear the auth cookie
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
