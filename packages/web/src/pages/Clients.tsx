import { useState } from 'react'
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '../lib/entities'
import { useForm } from 'react-hook-form'

export default function Clients() {
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [search, setSearch] = useState('')

  const { data: clients, isLoading } = useClients({ search })
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()
  const deleteMutation = useDeleteClient()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const openCreateModal = () => {
    setEditingClient(null)
    reset({
      companyName: '',
      billingAddress: '',
      billingEmail: '',
      notes: '',
    })
    setShowModal(true)
  }

  const openEditModal = (client: any) => {
    setEditingClient(client)
    setValue('companyName', client.companyName)
    setValue('billingAddress', client.billingAddress || '')
    setValue('billingEmail', client.billingEmail || '')
    setValue('notes', client.notes || '')
    setValue('isActive', client.isActive)
    setShowModal(true)
  }

  const onSubmit = async (data: any) => {
    try {
      if (editingClient) {
        await updateMutation.mutateAsync({ id: editingClient.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      setShowModal(false)
      reset()
    } catch (error) {
      console.error('Failed to save client:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!clients || clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{client.companyName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.contacts?.[0]?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.billingEmail || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client._count?.jobs || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(client)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingClient ? 'Edit Client' : 'Add Client'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  {...register('companyName', { required: 'Required' })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.companyName && (
                  <p className="text-red-600 text-sm mt-1">{errors.companyName.message as string}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <input
                  {...register('billingAddress')}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Email
                </label>
                <input
                  {...register('billingEmail')}
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {editingClient && (
                <div className="flex items-center">
                  <input
                    {...register('isActive')}
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
              )}

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
