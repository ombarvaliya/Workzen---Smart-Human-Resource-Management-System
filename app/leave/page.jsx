"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { DataTable } from "@/components/data-table"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle } from "lucide-react"

export default function Leave() {
  const [leaves, setLeaves] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    type: "Sick Leave",
    from: "",
    to: "",
    reason: ""
  })

  // Fetch user and leaves on mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'))

    setUser(userData)
    
    if (userData) {
      fetchLeaves(userData)
    }
  }, [])

  const fetchLeaves = async (userData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/leave', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (result.success) {
        setLeaves(result.data || [])
      } else {
        console.error('Failed to fetch leaves:', result.error);
        alert(result.error || 'Failed to fetch leaves');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error)
      alert('Error fetching leaves. Please check console for details.');
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: `${formData.type} - ${formData.reason}`,
          from: formData.from,
          to: formData.to,
          status: 'Pending'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Leave request submitted successfully!')
        setShowForm(false)
        setFormData({ type: "Sick Leave", from: "", to: "", reason: "" })
        fetchLeaves(user)
      } else {
        alert(result.error || 'Failed to submit leave request')
      }
    } catch (error) {
      console.error('Error submitting leave:', error)
      alert('Error submitting leave request')
    }
  }

  const handleApprove = async (leaveId) => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/leave', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveId: leaveId,
          status: 'Approved'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Leave approved successfully!')
        fetchLeaves(user)
      } else {
        alert(result.error || 'Failed to approve leave')
      }
    } catch (error) {
      console.error('Error approving leave:', error)
      alert('Error approving leave')
    }
  }

  const handleReject = async (leaveId) => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/leave', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveId: leaveId,
          status: 'Rejected'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Leave rejected successfully!')
        fetchLeaves(user)
      } else {
        alert(result.error || 'Failed to reject leave')
      }
    } catch (error) {
      console.error('Error rejecting leave:', error)
      alert('Error rejecting leave')
    }
  }

  const headers = ["Name", "Type", "Start Date", "End Date", "Status", "Reason", "Actions"]
  const rows = leaves.map((leave) => [
    leave.user?.name || "N/A",
    leave.reason?.split(' - ')[0] || "Leave",
    new Date(leave.from).toLocaleDateString('en-GB'),
    new Date(leave.to).toLocaleDateString('en-GB'),
    <span
      key={`status-${leave.id}`}
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        leave.status === "Approved"
          ? "bg-green-50 text-green-700"
          : leave.status === "Pending"
            ? "bg-yellow-50 text-yellow-700"
            : "bg-red-50 text-red-700"
      }`}
    >
      {leave.status}
    </span>,
    leave.reason?.split(' - ')[1] || leave.reason || "N/A",
    // Actions column - show only for Admin/Manager/HR Officer and Pending status
    (user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR Officer') && leave.status === 'Pending' ? (
      <div key={`actions-${leave.id}`} className="flex gap-2">
        <button
          onClick={() => handleApprove(leave.id)}
          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          title="Approve"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleReject(leave.id)}
          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          title="Reject"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <span key={`actions-${leave.id}`} className="text-muted-foreground text-sm">
        {leave.status === 'Pending' ? '-' : 'Processed'}
      </span>
    )
  ])

  return (
    <LayoutWrapper>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground">
              {user?.role === 'Employee' ? 'Request and track your leaves' : 'Manage employee leaves'}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {showForm ? "Close" : "Request Leave"}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-6 space-y-4"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leave Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>Sick Leave</option>
                  <option>Vacation</option>
                  <option>Personal Leave</option>
                  <option>Emergency Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.from}
                    onChange={(e) => setFormData({...formData, from: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.to}
                    onChange={(e) => setFormData({...formData, to: e.target.value})}
                    required
                    min={formData.from}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3}
                  placeholder="Please provide a reason for your leave..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Submit Request
              </button>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading leaves...</div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No leave requests found</div>
        ) : (
          <DataTable headers={headers} rows={rows} />
        )}
      </motion.div>
    </LayoutWrapper>
  )
}
