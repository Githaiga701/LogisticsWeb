import { locationRepository, CreateLocationData, UpdateLocationData } from '../repositories/location.repository'

export async function createLocation(data: CreateLocationData) {
  return locationRepository.create(data)
}

export async function getLocations(filters?: { clientId?: string; locationType?: string; search?: string }) {
  return locationRepository.findMany(filters)
}

export async function getLocation(id: string) {
  return locationRepository.findById(id)
}

export async function updateLocation(id: string, data: UpdateLocationData) {
  const location = await locationRepository.findById(id)
  if (!location) {
    throw new Error('LOCATION_NOT_FOUND')
  }

  return locationRepository.update(id, data)
}

export async function deleteLocation(id: string) {
  const location = await locationRepository.findById(id)
  if (!location) {
    throw new Error('LOCATION_NOT_FOUND')
  }

  return locationRepository.softDelete(id)
}
