import { useDriverAssignments } from '../lib/entities'
import { useAuthStore } from '../stores/auth.store'
import { useNavigate } from 'react-router-dom'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  DISPATCHED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  ARRIVED: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  DISPATCHED: 'Dispatched',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
}

export default function DriverDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data: assignments, isLoading } = useDriverAssignments()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const activeAssignments = assignments?.filter(
    (a: any) => !['CANCELLED', 'REASSIGNED', 'CLOSED', 'REJECTED'].includes(a.status)
  ) || []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </header>

      <main className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Assignments ({activeAssignments.length})
        </h2>

        {activeAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No active assignments</p>
            <p className="text-sm text-gray-400 mt-1">
              New assignments will appear here when assigned
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAssignments.map((assignment: any) => (
              <div
                key={assignment.id}
                onClick={() => navigate(`/driver/assignment/${assignment.id}`)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer active:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {assignment.job.jobNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {assignment.job.client.companyName}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[assignment.status]
                    }`}
                  >
                    {statusLabels[assignment.status]}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-sm">●</span>
                    <div className="text-sm">
                      <p className="text-gray-900">{assignment.job.pickupLocation.name}</p>
                      <p className="text-gray-500 text-xs">
                        {assignment.job.pickupLocation.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 text-sm">●</span>
                    <div className="text-sm">
                      <p className="text-gray-900">{assignment.job.dropoffLocation.name}</p>
                      <p className="text-gray-500 text-xs">
                        {assignment.job.dropoffLocation.city}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{assignment.unit.plateNumber}</span>
                    <span className="mx-2">•</span>
                    <span>{assignment.unit.unitType}</span>
                  </div>
                  <span className="text-blue-600 text-sm font-medium">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
