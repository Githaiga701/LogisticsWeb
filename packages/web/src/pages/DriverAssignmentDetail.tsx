import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useState } from 'react'

const statusActions: Record<string, { label: string; action: string; color: string }[]> = {
  PENDING: [
    { label: 'Accept', action: 'accept', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Reject', action: 'reject', color: 'bg-red-600 hover:bg-red-700' },
  ],
  ACCEPTED: [
    { label: 'Start Trip', action: 'dispatch', color: 'bg-blue-600 hover:bg-blue-700' },
  ],
  DISPATCHED: [
    { label: 'Mark Departed', action: 'depart', color: 'bg-purple-600 hover:bg-purple-700' },
  ],
  IN_TRANSIT: [
    { label: 'Mark Arrived', action: 'arrive', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'Report Delay', action: 'delay', color: 'bg-yellow-600 hover:bg-yellow-700' },
  ],
  ARRIVED: [
    { label: 'Complete Job', action: 'complete', color: 'bg-green-600 hover:bg-green-700' },
  ],
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-300',
  DISPATCHED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  IN_TRANSIT: 'bg-purple-100 text-purple-800 border-purple-300',
  ARRIVED: 'bg-orange-100 text-orange-800 border-orange-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
}

export default function DriverAssignmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDelayModal, setShowDelayModal] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: assignment, isLoading, refetch } = useQuery({
    queryKey: ['driverAssignment', id],
    queryFn: async () => {
      const response = await api.get(`/api/driver/assignments/${id}`)
      return response.data
    },
    enabled: !!id,
  })

  const handleAction = async (action: string) => {
    if (action === 'reject') {
      setShowRejectModal(true)
      return
    }
    if (action === 'delay') {
      setShowDelayModal(true)
      return
    }

    setLoading(true)
    try {
      await api.post(`/api/driver/assignments/${id}/${action}`, {})
      refetch()
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitWithReason = async (action: string) => {
    setLoading(true)
    try {
      await api.post(`/api/driver/assignments/${id}/${action}`, { reason })
      setShowRejectModal(false)
      setShowDelayModal(false)
      setReason('')
      if (action === 'reject') {
        navigate('/driver')
      } else {
        refetch()
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Assignment not found</div>
      </div>
    )
  }

  const actions = statusActions[assignment.status] || []

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              {assignment.job.jobNumber}
            </h1>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              statusColors[assignment.status]
            }`}
          >
            {assignment.status}
          </span>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Client Info */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Client</h2>
          <p className="text-lg font-semibold text-gray-900">
            {assignment.job.client.companyName}
          </p>
          {assignment.job.contact && (
            <p className="text-sm text-gray-600 mt-1">
              Contact: {assignment.job.contact.name} ({assignment.job.contact.phone})
            </p>
          )}
        </section>

        {/* Route */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Route</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <div className="w-0.5 h-12 bg-gray-300" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {assignment.job.pickupLocation.name}
                </p>
                <p className="text-sm text-gray-500">
                  {assignment.job.pickupLocation.address}
                </p>
                <p className="text-sm text-gray-500">
                  {assignment.job.pickupLocation.city}, {assignment.job.pickupLocation.state}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {assignment.job.dropoffLocation.name}
                </p>
                <p className="text-sm text-gray-500">
                  {assignment.job.dropoffLocation.address}
                </p>
                <p className="text-sm text-gray-500">
                  {assignment.job.dropoffLocation.city}, {assignment.job.dropoffLocation.state}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Load Details */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Load Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium text-gray-900">{assignment.job.loadType}</p>
            </div>
            {assignment.job.weightTons && (
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="font-medium text-gray-900">{assignment.job.weightTons} tons</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p className="font-medium text-gray-900">{assignment.job.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="font-medium text-gray-900">
                {new Date(assignment.job.scheduledDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {assignment.job.specialInstructions && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">Special Instructions</p>
              <p className="text-gray-900 mt-1">{assignment.job.specialInstructions}</p>
            </div>
          )}
        </section>

        {/* Unit */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Vehicle</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{assignment.unit.plateNumber}</p>
              <p className="text-sm text-gray-500">
                {assignment.unit.unitType} - {assignment.unit.bodyType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium text-gray-900">{assignment.unit.capacityTons} tons</p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        {assignment.events && assignment.events.length > 0 && (
          <section className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">Timeline</h2>
            <div className="space-y-3">
              {assignment.events.map((event: any) => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <div className="text-gray-400 w-20">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{event.eventType}</span>
                    {event.notes && (
                      <span className="text-gray-500 ml-2">- {event.notes}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="flex gap-3">
            {actions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleAction(action.action)}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg text-white font-medium ${action.color} disabled:opacity-50`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Reject Assignment</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason..."
              className="w-full border rounded-lg p-3 h-24 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 border rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitWithReason('reject')}
                disabled={loading || !reason}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Report Delay</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the delay reason..."
              className="w-full border rounded-lg p-3 h-24 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDelayModal(false)}
                className="flex-1 py-2 border rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitWithReason('delay')}
                disabled={loading || !reason}
                className="flex-1 py-2 bg-yellow-600 text-white rounded-lg disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
