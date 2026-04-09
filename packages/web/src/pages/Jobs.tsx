import { useState } from 'react'
import { useJobs, useCreateJob, useUpdateJob, useCancelJob } from '../lib/entities'
import { useClients } from '../lib/entities'
import { useLocations } from '../lib/entities'
import { useForm } from 'react-hook-form'

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function Jobs() {
  const [showModal, setShowModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: jobs, isLoading } = useJobs({ status: statusFilter as any, search })
  const { data: clients } = useClients()
  const { data: locations } = useLocations()
  const createMutation = useCreateJob()
  const updateMutation = useUpdateJob()
  const cancelMutation = useCancelJob()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const { register: registerCancel, handleSubmit: handleSubmitCancel, reset: resetCancel } = useForm()

  const openCreateModal = () => {
    setSelectedJob(null)
    reset({
      clientId: '',
      pickupLocationId: '',
      dropoffLocationId: '',
      loadType: '',
      weightTons: '',
      priority: 'NORMAL',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '',
      specialInstructions: '',
    })
    setShowModal(true)
  }

  const openEditModal = (job: any) => {
    setSelectedJob(job)
    setValue('clientId', job.clientId)
    setValue('contactId', job.contactId || '')
    setValue('pickupLocationId', job.pickupLocationId)
    setValue('dropoffLocationId', job.dropoffLocationId)
    setValue('loadType', job.loadType)
    setValue('weightTons', job.weightTons || '')
    setValue('priority', job.priority)
    setValue('scheduledDate', new Date(job.scheduledDate).toISOString().split('T')[0])
    setValue('scheduledTime', job.scheduledTime || '')
    setValue('specialInstructions', job.specialInstructions || '')
    setShowModal(true)
  }

  const openCancelModal = (job: any) => {
    setSelectedJob(job)
    resetCancel()
    setShowCancelModal(true)
  }

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        weightTons: data.weightTons ? parseFloat(data.weightTons) : undefined,
        scheduledDate: new Date(data.scheduledDate).toISOString(),
      }

      if (selectedJob) {
        await updateMutation.mutateAsync({ id: selectedJob.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      setShowModal(false)
      reset()
    } catch (error) {
      console.error('Failed to save job:', error)
    }
  }

  const onCancelSubmit = async (data: any) => {
    try {
      await cancelMutation.mutateAsync({ 
        id: selectedJob.id, 
        reason: data.reason 
      })
      setShowCancelModal(false)
      resetCancel()
    } catch (error) {
      console.error('Failed to cancel job:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search jobs..."
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
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!jobs || jobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No jobs found
                </td>
              </tr>
            ) : (
              jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {job.jobNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.client?.companyName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">
                      {job.pickupLocation?.city} → {job.dropoffLocation?.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[job.priority]}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.scheduledDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                      <>
                        <button
                          onClick={() => openEditModal(job)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openCancelModal(job)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedJob ? 'Edit Job' : 'Create Job'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  {...register('clientId', { required: 'Required' })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select client</option>
                  {clients?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="text-red-600 text-sm mt-1">{errors.clientId.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location *
                  </label>
                  <select
                    {...register('pickupLocationId', { required: 'Required' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select location</option>
                    {locations?.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drop-off Location *
                  </label>
                  <select
                    {...register('dropoffLocationId', { required: 'Required' })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select location</option>
                    {locations?.map((l: any) => (
                      <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Load Type *
                  </label>
                  <input
                    {...register('loadType', { required: 'Required' })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., General Cargo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (tons)
                  </label>
                  <input
                    {...register('weightTons')}
                    type="number"
                    step="0.1"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select {...register('priority')} className="w-full border rounded-lg px-3 py-2">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date *
                  </label>
                  <input
                    {...register('scheduledDate', { required: 'Required' })}
                    type="date"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    {...register('scheduledTime')}
                    type="time"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  {...register('specialInstructions')}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
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
                  {selectedJob ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cancel Job</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel <strong>{selectedJob?.jobNumber}</strong>?
            </p>
            <form onSubmit={handleSubmitCancel(onCancelSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  {...registerCancel('reason', { required: 'Required' })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Please provide a reason for cancellation"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  No, Keep Job
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Yes, Cancel Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
