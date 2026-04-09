# Logistics Management Platform
## Business Requirements Document (BRD) v2.0

---

# 1. Project Description

A modern logistics management platform designed to streamline the coordination of trucks, drivers, and delivery operations for dynamic transport businesses. The system enables administrators to efficiently manage jobs, assign drivers and vehicles, and monitor delivery progress in real time through a structured, event-driven workflow.

Unlike traditional fleet management systems that rely on GPS tracking, this platform adopts a lightweight and cost-effective approach by allowing drivers to manually update key milestones such as departure, arrival, and job completion. This ensures operational visibility while remaining practical in environments with limited infrastructure.

The platform centralizes all logistics operations into a unified dashboard, providing insights into truck utilization, driver activity, and job status. Built with scalability and extensibility in mind, it supports future enhancements such as automated ETA prediction, analytics, and mobile applications.

---

# 2. Overview

## 2.1 Purpose

This document defines the workflow, system architecture, and business requirements for the logistics platform.

## 2.2 Objectives

- Centralize logistics operations
- Track job lifecycle without GPS
- Improve accountability and transparency
- Reduce manual coordination overhead
- Provide operational insights
- Enable proof of delivery capture
- Support conflict resolution and reassignments

## 2.3 Stakeholders

- Business Owner (Admin)
- Dispatch Staff
- Drivers
- Clients (future)

---

# 3. System Overview

## 3.1 Core Concept

The system revolves around **Assignments**, which connect:
- Jobs (delivery tasks)
- Drivers (personnel)
- Units (vehicles)

Tracking is achieved through **event logging**, not geolocation.

## 3.2 Key Modules

- User Management (RBAC)
- Driver Management
- Unit Management
- Client Management
- Job Management
- Assignment Management
- Event Logging System
- Notification System
- Admin Dashboard

---

# 4. Actors

## 4.1 Admin

- Creates jobs
- Assigns drivers and trucks
- Monitors operations
- Reviews logs and reports
- Manages users, drivers, units, clients
- Handles reassignments and cancellations

## 4.2 Driver

- Logs into the system
- Views assigned jobs
- Accepts/Rejects assignments
- Updates job progress via actions
- Captures proof of delivery

## 4.3 Dispatch Staff

- Creates jobs
- Monitors active assignments
- Communicates with drivers
- Handles escalations

---

# 5. Core Entities

| Entity | Description |
|--------|-------------|
| Users | Authentication and roles |
| Drivers | Driver profiles linked to users |
| Units | Trucks/vehicles |
| Clients | Business clients with contacts |
| Locations | Standardized addresses |
| Jobs | Delivery records |
| Assignments | Job + Driver + Unit mapping |
| Events | Timestamped activity logs |
| Notifications | System alerts |
| Documents | Proof of delivery, contracts |

---

# 6. Workflow

## 6.1 High-Level Job Lifecycle

```
JOB_CREATED → ASSIGNMENT_CREATED → PENDING → ACCEPTED → DISPATCHED → 
IN_TRANSIT → ARRIVED → COMPLETED → CLOSED

Alternative paths:
- REJECTED (driver declines)
- CANCELLED (admin/dispatch cancels)
- REASSIGNED (driver unavailable)
```

## 6.2 Detailed Workflow

### Step 1: Client & Location Setup (Admin)

Admin creates/updates:
- Client information (name, company, billing details)
- Client contacts (primary, secondary with phone/email)
- Frequently used locations (depot, warehouses)

### Step 2: Job Creation (Admin/Dispatch)

Creates job including:
- Pickup location (from locations or ad-hoc)
- Drop-off location (from locations or ad-hoc)
- Client selection
- Contact person at delivery site
- Load type
- Priority (LOW, NORMAL, HIGH, URGENT)
- Scheduled date/time
- Special instructions/notes

### Step 3: Assignment Creation (Admin)

Admin assigns:
- Driver (checks availability)
- Truck/Unit (checks availability)
- Scheduled departure time

System validates:
- Driver not already on active assignment
- Unit not already on active assignment
- Driver license valid
- Unit insurance valid

System creates Assignment:
- Status: `PENDING`
- Sends notification to driver

### Step 4: Driver Interaction

| Action | Result | Notes |
|--------|--------|-------|
| Accept Assignment | `ACCEPTED` | Driver confirms availability |
| Reject Assignment | `REJECTED` | Driver provides reason, admin notified |
| Start Trip | `DISPATCHED` | Driver departs to pickup |
| Mark Departed (from pickup) | `IN_TRANSIT` | Event logged, ETA calculated |
| Mark Arrived | `ARRIVED` | Event logged |
| Complete Job | `COMPLETED` | Proof of delivery captured |
| Report Delay | Event logged | Admin notified, ETA updated |

### Step 5: Proof of Delivery

Driver captures:
- Delivery timestamp
- Recipient name
- Recipient signature (optional)
- Photos (optional)
- Notes/exceptions

### Step 6: Job Closure

Admin reviews:
- Events timeline
- Proof of delivery
- Driver notes
- Marks job as `CLOSED` or flags for review

## 6.3 Exception Handling

### Reassignment Flow

Triggers:
- Driver rejects assignment
- Driver calls in sick
- Driver unable to complete
- Vehicle breakdown

Process:
1. Admin marks assignment for reassignment
2. System logs reassignment event
3. Admin assigns new driver/unit
4. New assignment starts at `PENDING`
5. Original assignment marked `REASSIGNED`

### Cancellation Flow

Triggers:
- Client cancels order
- Job no longer needed
- Error in job creation

Process:
1. Admin initiates cancellation
2. System validates: assignment not yet `IN_TRANSIT`
3. If validated:
   - Status: `CANCELLED`
   - Reason logged
   - Driver notified
   - Resources freed
4. If `IN_TRANSIT` or beyond:
   - Requires supervisor approval
   - Driver must mark as `CANCELLED` with reason

---

# 7. Event-Based Tracking

## 7.1 Event Types

| Event Type | Data Captured | Trigger |
|------------|---------------|---------|
| CREATED | Timestamp, creator | Job/Assignment created |
| ACCEPTED | Timestamp, driver_id | Driver accepts |
| REJECTED | Timestamp, reason | Driver rejects |
| DISPATCHED | Timestamp, odometer (opt) | Driver starts trip |
| DEPARTED | Timestamp, location | Driver leaves pickup |
| IN_TRANSIT | Timestamp, ETA estimate | En route |
| ARRIVED | Timestamp, location | Driver at destination |
| COMPLETED | Timestamp, POD data | Delivery confirmed |
| DELAYED | Timestamp, reason, new ETA | Delay reported |
| CANCELLED | Timestamp, reason, approved_by | Job cancelled |
| REASSIGNED | Timestamp, from_driver, to_driver | Driver changed |
| CLOSED | Timestamp, closed_by | Admin closes job |

## 7.2 Event Requirements

- Immutable after creation
- Sequential timestamps
- Includes actor (who triggered)
- Includes metadata (optional)

---

# 8. State Machine

## 8.1 Assignment States

```
PENDING → ACCEPTED → DISPATCHED → IN_TRANSIT → ARRIVED → COMPLETED → CLOSED
    ↓
 REJECTED                                        ↓
                                              CANCELLED
```

## 8.2 Valid Transitions

| Current State | Allowed Next States |
|----------------|---------------------|
| PENDING | ACCEPTED, REJECTED, CANCELLED, REASSIGNED |
| ACCEPTED | DISPATCHED, CANCELLED, REASSIGNED |
| DISPATCHED | IN_TRANSIT, DELAYED, CANCELLED |
| IN_TRANSIT | ARRIVED, DELAYED |
| DELAYED | IN_TRANSIT, ARRIVED, CANCELLED |
| ARRIVED | COMPLETED, DELAYED |
| COMPLETED | CLOSED |
| REJECTED | (terminal) |
| CANCELLED | (terminal) |
| CLOSED | (terminal) |

## 8.3 Rules

- No skipping states (must follow sequence)
- No backward transitions
- Backend validation enforced
- Audit trail maintained
- Terminal states cannot be changed

---

# 9. Dashboard Structure

## 9.1 Admin Dashboard

- Today's active jobs count
- Pending assignments
- Completed jobs today
- Delayed/in-issue jobs
- Driver availability overview
- Unit utilization chart
- Recent activity feed

## 9.2 Units Page

- Truck list with filters
- Unit details:
  - Plate number
  - Capacity (tons)
  - Type (trailer, truck, van)
  - Body type (closed, open, refrigerated)
  - Insurance details (provider, policy, expiry)
  - Registration expiry
  - Current status (Available, Assigned, Maintenance)
  - Current assignment (if any)
  - Assignment history

## 9.3 Drivers Page

- Driver list with filters
- Driver details:
  - Name, contact
  - License number, class, expiry
  - Linked user account
  - Assigned unit (if permanent)
  - Current status (Available, On Trip, Off Duty)
  - Current assignment (if any)
  - Assignment history
  - Performance metrics (jobs completed, on-time rate)

## 9.4 Clients Page

- Client list
- Client details:
  - Company name, billing info
  - Primary/secondary contacts
  - Saved locations
  - Job history
  - Active jobs

## 9.5 Jobs Page

- Job list with filters (status, date, client, priority)
- Job details:
  - Pickup/drop-off locations
  - Client and contact
  - Load details
  - Priority level
  - Scheduled time
  - Current status
  - Assignment info (driver, unit)
  - Event timeline
  - Proof of delivery

## 9.6 Assignments Page (Core)

- Active assignments overview
- Assignment details:
  - Job reference
  - Driver and unit
  - Current status
  - Event timeline
  - Map view (future)
  - Proof of delivery

## 9.7 Reports Page

- Driver performance report
- Unit utilization report
- On-time delivery rate
- Job completion by client
- Delay analysis

---

# 10. Functional Requirements

## FR1: User Management

- Admin can create/edit/deactivate users
- Roles: Admin, Dispatch, Driver
- Secure authentication (JWT with refresh tokens)
- Password reset via email
- Session management
- Two-factor authentication (future)
- Soft delete for users

## FR2: Driver Management

- Add/edit/deactivate drivers
- Store license details (number, class, expiry)
- Link to user account for login
- Track driver status (Available, On Trip, Off Duty)
- View assignment history
- Performance metrics

## FR3: Unit Management

- Add/edit/archive units
- Track capacity, type, body type
- Track insurance and registration expiry
- Track availability status
- View assignment history
- Maintenance scheduling (future)
- Soft delete for units

## FR4: Client Management

- Add/edit/deactivate clients
- Multiple contacts per client
- Save frequent locations
- View job history
- Billing information (future)
- Soft delete for clients

## FR5: Location Management

- Add/edit locations
- Standardize addresses
- Store coordinates (for future mapping)
- Location types (depot, warehouse, client site)
- Soft delete for locations

## FR6: Job Management

- Create/edit/cancel jobs
- Select client and contacts
- Pickup/drop-off locations
- Priority levels (LOW, NORMAL, HIGH, URGENT)
- Scheduled date/time
- Special instructions
- Duplicate job functionality
- Soft delete for jobs

## FR7: Assignment Management

- Assign driver + unit to job
- Validate driver/unit availability
- Prevent double assignments
- Track full lifecycle
- Support reassignment
- Send notifications to driver
- Lock assignment (prevent changes after certain state)

## FR8: Driver Actions

- View assigned jobs
- Accept/Reject assignment
- Update status (dispatched, departed, arrived, completed)
- Report delays with reason
- Capture proof of delivery
- Add notes at any stage
- View job details

## FR9: Proof of Delivery

- Capture recipient name
- Capture recipient signature (optional)
- Capture photos (optional)
- Add delivery notes
- Timestamp verification

## FR10: Event Logging

- Store all actions as immutable events
- Include actor, timestamp, metadata
- Enable audit trail
- Support reporting
- No deletion of events

## FR11: Notification System

- Assignment notification to driver
- Status change notification to admin/dispatch
- Delay alerts
- Rejection alerts
- Cancellation alerts
- Email and in-app notifications
- SMS integration (future)
- Push notifications (future mobile app)

## FR12: Dashboard & Reporting

- Real-time dashboard
- Driver performance metrics
- Unit utilization metrics
- On-time delivery rate
- Delay analysis
- Export reports (CSV, PDF)

## FR13: Audit Trail

- Log all admin actions
- Track who made changes
- Track when changes were made
- View change history per entity

## FR14: Conflict Resolution

- Prevent double-booking at assignment time
- Warn if driver has active assignment
- Warn if unit has active assignment
- Automatic conflict detection
- Manual override with reason

---

# 11. Non-Functional Requirements

## Performance

- API response time < 500ms (p95)
- Page load time < 3 seconds
- Support 100+ concurrent users
- Handle 1000+ jobs/day

## Availability

- Target uptime: 99.5%
- Graceful degradation
- Health check endpoints

## Security

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention (via ORM)
- XSS prevention
- Rate limiting (100 req/min per user)
- Password hashing (bcrypt)
- HTTPS only
- CORS configuration
- Audit logging

## Scalability

- Horizontal scaling ready
- Database connection pooling
- Caching layer (Redis)
- Stateless API design

## Usability

- Mobile-responsive interface
- Driver-optimized mobile view
- Accessibility (WCAG 2.1 AA)
- Multi-language support (future)

## Data Retention

- Active data: indefinite
- Closed jobs: 7 years
- Events: 7 years
- Soft-deleted entities: 1 year before hard delete

---

# 12. System Architecture

## 12.1 Tech Stack

### Backend
- Runtime: Node.js 20+ LTS
- Framework: Fastify (high performance)
- Language: TypeScript 5+
- Database: PostgreSQL 15+
- ORM: Prisma
- Caching: Redis
- Queue: BullMQ (for notifications)
- File Storage: Local / S3-compatible

### Frontend
- Framework: React 18+
- Build Tool: Vite
- Styling: Tailwind CSS
- State Management: TanStack Query + Zustand
- Forms: React Hook Form + Zod
- UI Components: Shadcn/ui

### Infrastructure
- Containerization: Docker
- Reverse Proxy: Nginx
- SSL: Let's Encrypt / Cloudflare
- Monitoring: PM2 / Docker logs
- CI/CD: GitHub Actions

## 12.2 Core Services

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
├─────────────────────────────────────────────────────────────┤
│  Auth Service │ User Service │ Notification Service         │
├─────────────────────────────────────────────────────────────┤
│  Job Service │ Assignment Service │ Event Service           │
├─────────────────────────────────────────────────────────────┤
│  Driver Service │ Unit Service │ Client Service             │
├─────────────────────────────────────────────────────────────┤
│                     File Service                            │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  File Storage (S3/Local)           │
└─────────────────────────────────────────────────────────────┘
```

---

# 13. Database Design

## 13.1 Entity Relationship

```
Users ─┬─> Drivers ─┬─> Assignments <── Units
       │            │         │
       │            │         └──> Events
       │            │
       │            └──> DriverUnits (historical)
       │
       └─> AuditLogs

Clients ─┬─> Contacts
         ├─> Locations
         └──> Jobs ───> Assignments

Jobs ───> Documents (POD, contracts)
```

## 13.2 Table Schemas

### users
- id (UUID, PK)
- email (string, unique)
- password_hash (string)
- role (enum: ADMIN, DISPATCH, DRIVER)
- is_active (boolean)
- last_login (timestamp)
- created_at, updated_at (timestamps)
- deleted_at (timestamp, nullable)

### drivers
- id (UUID, PK)
- user_id (UUID, FK -> users)
- first_name (string)
- last_name (string)
- phone (string)
- license_number (string)
- license_class (string)
- license_expiry (date)
- status (enum: AVAILABLE, ON_TRIP, OFF_DUTY)
- created_at, updated_at (timestamps)
- deleted_at (timestamp, nullable)

### units
- id (UUID, PK)
- plate_number (string, unique)
- capacity_tons (decimal)
- unit_type (enum: TRUCK, TRAILER, VAN, OTHER)
- body_type (enum: CLOSED, OPEN, REFRIGERATED, TANKER, OTHER)
- insurance_provider (string)
- insurance_policy (string)
- insurance_expiry (date)
- registration_expiry (date)
- status (enum: AVAILABLE, ASSIGNED, MAINTENANCE)
- created_at, updated_at (timestamps)
- deleted_at (timestamp, nullable)

### clients
- id (UUID, PK)
- company_name (string)
- billing_address (string, nullable)
- billing_email (string, nullable)
- notes (text, nullable)
- is_active (boolean)
- created_at, updated_at (timestamps)
- deleted_at (timestamp, nullable)

### client_contacts
- id (UUID, PK)
- client_id (UUID, FK -> clients)
- name (string)
- phone (string)
- email (string, nullable)
- is_primary (boolean)
- created_at, updated_at (timestamps)

### locations
- id (UUID, PK)
- client_id (UUID, FK -> clients, nullable)
- name (string)
- address (string)
- city (string)
- state (string)
- postal_code (string)
- country (string)
- latitude (decimal, nullable)
- longitude (decimal, nullable)
- location_type (enum: DEPOT, WAREHOUSE, CLIENT_SITE, OTHER)
- created_at, updated_at (timestamps)
- deleted_at (timestamp, nullable)

### jobs
- id (UUID, PK)
- job_number (string, unique)
- client_id (UUID, FK -> clients)
- contact_id (UUID, FK -> client_contacts)
- pickup_location_id (UUID, FK -> locations)
- dropoff_location_id (UUID, FK -> locations)
- pickup_address (text) - for ad-hoc addresses
- dropoff_address (text) - for ad-hoc addresses
- load_type (string)
- weight_tons (decimal, nullable)
- priority (enum: LOW, NORMAL, HIGH, URGENT)
- scheduled_date (date)
- scheduled_time (time, nullable)
- special_instructions (text, nullable)
- status (enum: DRAFT, PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED)
- created_by (UUID, FK -> users)
- created_at, updated_at (timestamps)
- deleted_at (timestamp, nullable)

### assignments
- id (UUID, PK)
- job_id (UUID, FK -> jobs)
- driver_id (UUID, FK -> drivers)
- unit_id (UUID, FK -> units)
- status (enum: PENDING, ACCEPTED, REJECTED, DISPATCHED, IN_TRANSIT, ARRIVED, COMPLETED, CANCELLED, REASSIGNED, CLOSED)
- rejection_reason (text, nullable)
- cancellation_reason (text, nullable)
- cancelled_by (UUID, FK -> users, nullable)
- reassigned_from (UUID, FK -> assignments, nullable)
- created_by (UUID, FK -> users)
- created_at, updated_at (timestamps)

### events
- id (UUID, PK)
- assignment_id (UUID, FK -> assignments)
- event_type (enum)
- actor_id (UUID, FK -> users)
- timestamp (timestamp)
- notes (text, nullable)
- metadata (jsonb, nullable)
- created_at (timestamp)

### documents
- id (UUID, PK)
- assignment_id (UUID, FK -> assignments)
- document_type (enum: POD_SIGNATURE, POD_PHOTO, CONTRACT, OTHER)
- file_path (string)
- file_name (string)
- file_size (integer)
- mime_type (string)
- uploaded_by (UUID, FK -> users)
- created_at (timestamp)

### notifications
- id (UUID, PK)
- user_id (UUID, FK -> users)
- type (enum: ASSIGNMENT, STATUS_CHANGE, DELAY, CANCELLATION, REJECTION, SYSTEM)
- title (string)
- message (text)
- data (jsonb, nullable)
- read_at (timestamp, nullable)
- created_at (timestamp)

### audit_logs
- id (UUID, PK)
- actor_id (UUID, FK -> users)
- action (string)
- entity_type (string)
- entity_id (UUID)
- old_value (jsonb, nullable)
- new_value (jsonb, nullable)
- ip_address (string, nullable)
- created_at (timestamp)

---

# 14. API Endpoints (Summary)

## Authentication
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

## Users (Admin)
- GET /api/users
- POST /api/users
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id (soft delete)

## Drivers
- GET /api/drivers
- POST /api/drivers
- GET /api/drivers/:id
- PUT /api/drivers/:id
- DELETE /api/drivers/:id (soft delete)
- GET /api/drivers/:id/assignments
- GET /api/drivers/:id/performance

## Units
- GET /api/units
- POST /api/units
- GET /api/units/:id
- PUT /api/units/:id
- DELETE /api/units/:id (soft delete)
- GET /api/units/:id/assignments

## Clients
- GET /api/clients
- POST /api/clients
- GET /api/clients/:id
- PUT /api/clients/:id
- DELETE /api/clients/:id (soft delete)
- GET /api/clients/:id/jobs

## Contacts
- GET /api/clients/:clientId/contacts
- POST /api/clients/:clientId/contacts
- PUT /api/contacts/:id
- DELETE /api/contacts/:id

## Locations
- GET /api/locations
- POST /api/locations
- GET /api/locations/:id
- PUT /api/locations/:id
- DELETE /api/locations/:id (soft delete)

## Jobs
- GET /api/jobs
- POST /api/jobs
- GET /api/jobs/:id
- PUT /api/jobs/:id
- DELETE /api/jobs/:id (soft delete)
- POST /api/jobs/:id/cancel
- POST /api/jobs/:id/duplicate

## Assignments
- GET /api/assignments
- POST /api/assignments
- GET /api/assignments/:id
- PUT /api/assignments/:id
- DELETE /api/assignments/:id (cancel)
- POST /api/assignments/:id/reassign

## Driver Actions
- GET /api/driver/assignments (driver's own assignments)
- GET /api/driver/assignments/:id
- POST /api/driver/assignments/:id/accept
- POST /api/driver/assignments/:id/reject
- POST /api/driver/assignments/:id/dispatch
- POST /api/driver/assignments/:id/depart
- POST /api/driver/assignments/:id/arrive
- POST /api/driver/assignments/:id/complete
- POST /api/driver/assignments/:id/delay
- POST /api/driver/assignments/:id/pod (upload proof)

## Events
- GET /api/assignments/:assignmentId/events

## Notifications
- GET /api/notifications
- POST /api/notifications/:id/read
- POST /api/notifications/read-all

## Documents
- POST /api/documents (upload)
- GET /api/documents/:id
- DELETE /api/documents/:id

## Dashboard
- GET /api/dashboard/stats
- GET /api/dashboard/recent-activity

## Reports
- GET /api/reports/driver-performance
- GET /api/reports/unit-utilization
- GET /api/reports/on-time-delivery
- GET /api/reports/delay-analysis

---

# 15. Constraints

- No GPS tracking (manual updates only)
- Dependence on driver updates for tracking
- Mobile browser environment for drivers
- Internet connectivity required
- No offline support (Phase 1)

---

# 16. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Driver forgets updates | High | High | Push notifications, reminders, one-click updates |
| False reporting | Medium | High | Timestamp logging, photo verification, audit trail |
| Connectivity issues | Medium | Medium | Retry logic, queue offline actions (future) |
| Double booking | Medium | High | Real-time validation, conflict detection |
| License/insurance expiry | Low | High | Expiry alerts, validation at assignment |
| Data loss | Low | High | Regular backups, soft deletes |
| Unauthorized access | Medium | High | RBAC, rate limiting, audit logs |

---

# 17. Future Enhancements

## Phase 2
- Mobile application (React Native)
- Offline support with sync
- Push notifications
- SMS notifications
- Client portal

## Phase 3
- GPS tracking integration
- Real-time map view
- Automated ETA prediction
- Route optimization
- Advanced analytics dashboard

## Phase 4
- Multi-tenant support
- API for third-party integration
- IoT sensor integration (fuel, temperature)
- Automated dispatching with AI

---

# 18. Success Metrics

- Driver adoption rate > 90%
- Job completion visibility > 95%
- On-time delivery rate > 85%
- Admin time saved: 30% reduction in coordination
- User satisfaction score > 4.0/5.0

---

# 19. Conclusion

This platform provides a scalable, efficient, and practical solution for logistics management in environments where GPS tracking is not feasible. Its event-driven design ensures accountability, operational visibility, and a strong foundation for future growth. The comprehensive audit trail, proof of delivery, and conflict resolution mechanisms address critical operational needs while maintaining simplicity for end users.

---

# 20. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Owner | | | |
| Technical Lead | | | |
| Operations Manager | | | |
