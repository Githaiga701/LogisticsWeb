import { useState } from 'react'
import { useAssignments, useCreateAssignment, useUpdateAssignmentStatus } from '../lib/entities'
import { useJobs } from '../lib/entities'
import { useDrivers } from '../lib/entities'
import { useUnits } from '../lib/entities'
import { useForm } from 'react-hook-form'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  DISPATCHED: 'bg-indigo-100 text-indigo-800',
  IN_TRANSIT: 'bg-purple-100 text-purple-800',
  ARRIVED: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export default function Assignments() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: assignments, isLoading } = useAssignments({ 
    status: statusFilter as any 
  })
  const { data: jobs } = useJobs({ status: 'PENDING' })
  const { data: drivers } = useDrivers({ status: 'AVAILABLE' })
  const { data: units } = useUnits({ status: 'AVAILABLE' })
  
  const createMutation = useCreateAssignment()
  const updateStatusMutation = useUpdateAssignmentStatus()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const openCreateModal = () => {
    reset({
      jobId: '',
      driverId: '',
      unitId: '',
    })
    setShowModal(true)
  }

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      setShowModal(false)
      reset()
    } catch (error: any) {
      alert(error.message || 'Failed to create assignment')
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    if (confirm(`Change status to ${status}?`)) {
      try {
        await updateStatusMutation.mutateAsync({ id, status })
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }
  }

  const filteredAssignments = assignments?.filter((a: any) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      a.job?.jobNumber?.toLowerCase().includes(searchLower) ||
      a.driver?.firstName?.toLowerCase().includes(searchLower) ||
      a.driver?.lastName?.toLowerCase().includes(searchLower) ||
      a.unit?.plateNumber?.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="ARRIVED">Arrived</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!filteredAssignments || filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No assignments found
                </td>
              </tr>
            ) : (
              filteredAssignments.map((assignment: any) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{assignment.job?.jobNumber}</div>
                    <div className="text-sm text-gray-500">
                      {assignment.job?.pickupLocation?.city} → {assignment.job?.dropoffLocation?.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.job?.client?.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-gray-900">
                      {assignment.driver?.firstName} {assignment.driver?.lastName}
                    </div>
                    <div className="text-gray-500">{assignment.driver?.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-medium text-gray-900">{assignment.unit?.plateNumber}</div>
                    <div className="text-gray-500">{assignment.unit?.unitType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[assignment.status]}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {assignment.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusUpdate(assignment.id, 'ACCEPTED')}
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        Accept
                      </button>
                    )}
                    {assignment.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleStatusUpdate(assignment.id, 'DISPATCHED')}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Dispatch
                      </button>
                    )}
                    {!['COMPLETED', 'CANCELLED', 'REJECTED', 'CLOSED'].includes(assignment.status) && (
                      <button
                        onClick={() => handleStatusUpdate(assignment.id, 'CANCELLED')}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Assignment</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job *
                </label>
                <select
                  {...register('jobId', { required: 'Required' })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select job</option>
                  {jobs?.filter((j: any) => j.status === 'PENDING' || j.status === 'ASSIGNED').map((j: any) => (
                    <option key={j.id} value={j.id}>
                      {j.jobNumber} - {j.client?.companyName}
                    </option>
                  ))}
                </select>
                {errors.jobId && (
                  <p className="text-red-600 text-sm mt-1">{errors.jobId.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver *
                </label>
                <select
                  {...register('driverId', { required: 'Required' })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select driver</option>
                  {drivers?.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.firstName} {d.lastName} ({d.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  {...register('unitId', { required: 'Required' })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select unit</option>
                  {units?.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.plateNumber} - {u.unitType} ({u.capacityTons}t)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
