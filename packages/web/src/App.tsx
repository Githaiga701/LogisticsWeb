import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthHydration } from './hooks/useAuth'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Drivers = lazy(() => import('./pages/Drivers'))
const Units = lazy(() => import('./pages/Units'))
const Clients = lazy(() => import('./pages/Clients'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Assignments = lazy(() => import('./pages/Assignments'))
const DriverDashboard = lazy(() => import('./pages/DriverDashboard'))
const DriverAssignmentDetail = lazy(() => import('./pages/DriverAssignmentDetail'))

function App() {
  useAuthHydration()

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin/Dispatch Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute roles={['ADMIN', 'DISPATCH']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="units" element={<Units />} />
          <Route path="clients" element={<Clients />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="assignments" element={<Assignments />} />
        </Route>

        {/* Driver Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute roles={['DRIVER']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/assignment/:id"
          element={
            <ProtectedRoute roles={['DRIVER']}>
              <DriverAssignmentDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App
