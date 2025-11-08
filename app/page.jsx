"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-context"
import { motion } from "framer-motion"

const roles = [
  { value: "Admin", label: "Admin" },
  { value: "HR Officer", label: "HR Officer" },
  { value: "Payroll Officer", label: "Payroll Officer" },
  { value: "Employee", label: "Employee" },
]

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState("Employee")

  const handleLogin = async (e) => {
    e.preventDefault()
    if (email && password) {
      const userData = {
        email,
        name: email.split("@")[0],
        role: selectedRole,
        avatar: email.charAt(0).toUpperCase(),
      }
      login(userData)
      try {
        await router.push("/dashboard")
      } catch (error) {
        console.error("Navigation error:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">WZ</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-foreground mb-2">WorkZen</h1>
          <p className="text-center text-muted-foreground mb-8">HRMS Dashboard</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo credentials: Use any email, password, and select a role
          </p>
        </div>
      </motion.div>
    </div>
  )
}
