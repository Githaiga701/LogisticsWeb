import { useState } from 'react'
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '../lib/entities'
import { useForm } from 'react-hook-form'

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
}

const unitTypes = ['TRUCK', 'TRAILER', 'VAN', 'OTHER']
const bodyTypes = ['CLOSED', 'OPEN', 'REFRIGERATED', 'TANKER', 'OTHER']

export default function Units() {
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const { data: units, isLoading } = useUnits({ 
    status: statusFilter as any, 
    unitType: typeFilter as any, 
    search 
  })
  const createMutation = useCreateUnit()
  const updateMutation = useUpdateUnit()
  const deleteMutation = useDeleteUnit()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const openCreateModal = () => {
    setEditingUnit(null)
    reset({
      plateNumber: '',
      capacityTons: '',
      unitType: 'TRUCK',
      bodyType: 'CLOSED',
      insuranceProvider: '',
      insurancePolicy: '',
      insuranceExpiry: '',
      registrationExpiry: '',
    })
    setShowModal(true)
  }

  const openEditModal = (unit: any) => {
    setEditingUnit(unit)
    setValue('plateNumber', unit.plateNumber)
    setValue('capacityTons', unit.capacityTons)
    setValue('unitType', unit.unitType)
    setValue('bodyType', unit.bodyType)
    setValue('insuranceProvider', unit.insuranceProvider)
    setValue('insurancePolicy', unit.insurancePolicy)
    setValue('insuranceExpiry', unit.insuranceExpiry.split('T')[0])
    setValue('registrationExpiry', unit.registrationExpiry.split('T')[0])
    setShowModal(true)
  }

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        capacityTons: parseFloat(data.capacityTons),
        insuranceExpiry: new Date(data.insuranceExpiry).toISOString(),
        registrationExpiry: new Date(data.registrationExpiry).toISOString(),
      }

      if (editingUnit) {
        await updateMutation.mutateAsync({ id: editingUnit.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
      setShowModal(false)
      reset()
    } catch (error) {
      console.error('Failed to save unit:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Units</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Unit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Search units..."
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
          <option value="ASSIGNED">Assigned</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Types</option>
          {unitTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!units || units.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No units found
                </td>
              </tr>
            ) : (
              units.map((unit: any) => (
                <tr key={unit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {unit.plateNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.unitType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.bodyType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {unit.capacityTons} tons
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={
                      new Date(unit.insuranceExpiry) < new Date() 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-500'
                    }>
                      {new Date(unit.insuranceExpiry).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[unit.status]}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(unit)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
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
              {editingUnit ? 'Edit Unit' : 'Add Unit'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number
                </label>
                <input
                  {...register('plateNumber', { required: 'Required' })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.plateNumber && (
                  <p className="text-red-600 text-sm mt-1">{errors.plateNumber.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Type
                  </label>
                  <select {...register('unitType')} className="w-full border rounded-lg px-3 py-2">
                    {unitTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Type
                  </label>
                  <select {...register('bodyType')} className="w-full border rounded-lg px-3 py-2">
                    {bodyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (tons)
                </label>
                <input
                  {...register('capacityTons', { required: 'Required' })}
                  type="number"
                  step="0.1"
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.capacityTons && (
                  <p className="text-red-600 text-sm mt-1">{errors.capacityTons.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    {...register('insuranceProvider', { required: 'Required' })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    {...register('insurancePolicy', { required: 'Required' })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Expiry
                  </label>
                  <input
                    {...register('insuranceExpiry', { required: 'Required' })}
                    type="date"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Expiry
                  </label>
                  <input
                    {...register('registrationExpiry', { required: 'Required' })}
                    type="date"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
