export enum UserRole {
  ADMIN = 'ADMIN',
  DISPATCH = 'DISPATCH',
  DRIVER = 'DRIVER',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  OFF_DUTY = 'OFF_DUTY',
}

export enum UnitType {
  TRUCK = 'TRUCK',
  TRAILER = 'TRAILER',
  VAN = 'VAN',
  OTHER = 'OTHER',
}

export enum BodyType {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  REFRIGERATED = 'REFRIGERATED',
  TANKER = 'TANKER',
  OTHER = 'OTHER',
}

export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum LocationType {
  DEPOT = 'DEPOT',
  WAREHOUSE = 'WAREHOUSE',
  CLIENT_SITE = 'CLIENT_SITE',
  OTHER = 'OTHER',
}

export enum JobPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REASSIGNED = 'REASSIGNED',
  CLOSED = 'CLOSED',
}

export enum EventType {
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  DISPATCHED = 'DISPATCHED',
  DEPARTED = 'DEPARTED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
  REASSIGNED = 'REASSIGNED',
  CLOSED = 'CLOSED',
}

export enum NotificationType {
  ASSIGNMENT = 'ASSIGNMENT',
  STATUS_CHANGE = 'STATUS_CHANGE',
  DELAY = 'DELAY',
  CANCELLATION = 'CANCELLATION',
  REJECTION = 'REJECTION',
  SYSTEM = 'SYSTEM',
}

export enum DocumentType {
  POD_SIGNATURE = 'POD_SIGNATURE',
  POD_PHOTO = 'POD_PHOTO',
  CONTRACT = 'CONTRACT',
  OTHER = 'OTHER',
}

export const VALID_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  [AssignmentStatus.PENDING]: [AssignmentStatus.ACCEPTED, AssignmentStatus.REJECTED, AssignmentStatus.CANCELLED, AssignmentStatus.REASSIGNED],
  [AssignmentStatus.ACCEPTED]: [AssignmentStatus.DISPATCHED, AssignmentStatus.CANCELLED, AssignmentStatus.REASSIGNED],
  [AssignmentStatus.REJECTED]: [],
  [AssignmentStatus.DISPATCHED]: [AssignmentStatus.IN_TRANSIT, AssignmentStatus.DELAYED, AssignmentStatus.CANCELLED],
  [AssignmentStatus.IN_TRANSIT]: [AssignmentStatus.ARRIVED, AssignmentStatus.DELAYED],
  [AssignmentStatus.DELAYED]: [AssignmentStatus.IN_TRANSIT, AssignmentStatus.ARRIVED, AssignmentStatus.CANCELLED],
  [AssignmentStatus.ARRIVED]: [AssignmentStatus.COMPLETED, AssignmentStatus.DELAYED],
  [AssignmentStatus.COMPLETED]: [AssignmentStatus.CLOSED],
  [AssignmentStatus.CANCELLED]: [],
  [AssignmentStatus.REASSIGNED]: [],
  [AssignmentStatus.CLOSED]: [],
}

export const TERMINAL_STATES: AssignmentStatus[] = [
  AssignmentStatus.REJECTED,
  AssignmentStatus.CANCELLED,
  AssignmentStatus.CLOSED,
]
