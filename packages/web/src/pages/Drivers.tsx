import { useState } from 'react'
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from '../lib/entities'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const driverSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Needs uppercase').regex(/[a-z]/, 'Needs lowercase').regex(/[0-9]/, 'Needs number').optional().or(z.literal('')),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  licenseNumber: z.string().min(1, 'Required'),
  licenseClass: z.string().min(1, 'Required'),
  licenseExpiry: z.string().min(1, 'Required'),
})

type DriverForm = z.infer<typeof driverSchema>

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ON_TRIP: 'bg-blue-100 text-blue-800',
  OFF_DUTY: 'bg-gray-100 text-gray-800',
}

export default function Drivers() {
  const [showModal, setShowModal] = useState(false)
  const [editingDriver, setEditingDriver] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: drivers, isLoading } = useDrivers({ status: statusFilter as any, search })
  const createMutation = useCreateDriver()
  const updateMutation = useUpdateDriver()
  const deleteMutation = useDeleteDriver()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DriverForm>({
    resolver: zodResolver(driverSchema),
  })

  const openCreateModal = () => {
    setEditingDriver(null)
    reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      licenseNumber: '',
      licenseClass: '',
      licenseExpiry: '',
    })
    setShowModal(true)
  }

  const openEditModal = (driver: any) => {
    setEditingDriver(driver)
    setValue('email', driver.user.email)
    setValue('password', '')
    setValue('firstName', driver.firstName)
    setValue('lastName', driver.lastName)
    setValue('phone', driver.phone)
    setValue('licenseNumber', driver.licenseNumber)
    setValue('licenseClass', driver.licenseClass)
    setValue('licenseExpiry', driver.licenseExpiry.split('T')[0])
    setShowModal(true)
  }

  const onSubmit = async (data: DriverForm) => {
    try {
      const payload = {
        ...data,
        licenseExpiry: new Date(data.licenseExpiry).toISOString(),
      }

      if (editingDriver) {
        await updateMutation.mutateAsync({
          id: editingDriver.id,
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            licenseNumber: payload.licenseNumber,
            licenseClass: payload.licenseClass,
            licenseExpiry: payload.licenseExpiry,
          },
        })
      } else {
        await createMutation.mutateAsync({
          ...payload,
          password: payload.password || 'TempPass123!',
        })
      }
      setShowModal(false)
      reset()
    } catch (error) {
      console.error('Failed to save driver:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Driver
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search drivers..."
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
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="OFF_DUTY">Off Duty</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!drivers || drivers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver: any) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {driver.firstName} {driver.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.licenseNumber} ({driver.licenseClass})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={
                      new Date(driver.licenseExpiry) < new Date() 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-500'
                    }>
                      {new Date(driver.licenseExpiry).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[driver.status]}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(driver)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingDriver ? 'Edit Driver' : 'Add Driver'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  disabled={!!editingDriver}
                  className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {!editingDriver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Min 8 chars with upper, lower, number"
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  {...register('phone')}
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    {...register('licenseNumber')}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  {errors.licenseNumber && (
                    <p className="text-red-600 text-sm mt-1">{errors.licenseNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Class
                  </label>
                  <input
                    {...register('licenseClass')}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  {errors.licenseClass && (
                    <p className="text-red-600 text-sm mt-1">{errors.licenseClass.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Expiry
                </label>
                <input
                  {...register('licenseExpiry')}
                  type="date"
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.licenseExpiry && (
                  <p className="text-red-600 text-sm mt-1">{errors.licenseExpiry.message}</p>
                )}
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
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
