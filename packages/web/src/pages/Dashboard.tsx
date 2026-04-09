import { useDashboardStats, useRecentActivity } from '../lib/dashboard'
import { Link } from 'react-router-dom'

const eventColors: Record<string, string> = {
  ACCEPTED: 'text-green-600',
  REJECTED: 'text-red-600',
  DISPATCHED: 'text-blue-600',
  DEPARTED: 'text-purple-600',
  IN_TRANSIT: 'text-indigo-600',
  ARRIVED: 'text-orange-600',
  COMPLETED: 'text-green-600',
  DELAYED: 'text-yellow-600',
  CANCELLED: 'text-red-600',
}

const eventLabels: Record<string, string> = {
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  DISPATCHED: 'Dispatched',
  DEPARTED: 'Departed',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
  DELAYED: 'Delayed',
  CANCELLED: 'Cancelled',
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useRecentActivity()

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Active Jobs',
      value: stats?.jobs?.active || 0,
      color: 'bg-blue-500',
      link: '/jobs?status=active',
    },
    {
      label: 'Pending Assignments',
      value: stats?.jobs?.pendingAssignments || 0,
      color: 'bg-yellow-500',
      link: '/assignments?status=PENDING',
    },
    {
      label: 'Completed Today',
      value: stats?.jobs?.completedToday || 0,
      color: 'bg-green-500',
    },
    {
      label: 'Delayed Jobs',
      value: stats?.jobs?.delayed || 0,
      color: 'bg-red-500',
    },
    {
      label: 'Available Drivers',
      value: `${stats?.drivers?.available || 0}/${stats?.drivers?.total || 0}`,
      color: 'bg-emerald-500',
      link: '/drivers?status=AVAILABLE',
    },
    {
      label: 'Available Units',
      value: `${stats?.units?.available || 0}/${stats?.units?.total || 0}`,
      color: 'bg-cyan-500',
      link: '/units?status=AVAILABLE',
    },
    {
      label: 'On-Time Rate (30d)',
      value: `${stats?.performance?.onTimeRate || 0}%`,
      color: 'bg-indigo-500',
    },
    {
      label: 'Completed (30d)',
      value: stats?.performance?.completedLast30Days || 0,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} opacity-80`} />
            </div>
            {stat.link && (
              <Link
                to={stat.link}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
              >
                View all →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/jobs"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Job
          </Link>
          <Link
            to="/assignments"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Assignment
          </Link>
          <Link
            to="/drivers"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Driver
          </Link>
          <Link
            to="/units"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Add Unit
          </Link>
          <Link
            to="/clients"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Add Client
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {activityLoading ? (
          <div className="text-center py-8 text-gray-500">Loading activity...</div>
        ) : !activity || activity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {activity.slice(0, 10).map((event: any) => (
              <div
                key={event.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${eventColors[event.type]}`}>
                      {eventLabels[event.type]}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="font-medium text-gray-900">{event.jobNumber}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {event.client} • Driver: {event.driver}
                    {event.notes && ` • ${event.notes}`}
                  </div>
                </div>
                <div className="text-sm text-gray-400 whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
