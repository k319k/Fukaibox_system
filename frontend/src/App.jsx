import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SheetDetail from './pages/SheetDetail'
import Ranking from './pages/Ranking'
import UserList from './pages/UserList'
import Settings from './pages/Settings'
import UserManagement from './pages/UserManagement'
import BackupManagement from './pages/BackupManagement'
import AdminPanel from './pages/AdminPanel'
import PersonalSettings from './pages/PersonalSettings'
import DevStudio from './pages/DevStudio'
import Tools from './pages/Tools'
import ToolEditor from './pages/ToolEditor'
import AuthCallback from './pages/AuthCallback'
import { useAutoTokenRefresh } from './hooks/useAutoTokenRefresh'
import useHeartbeat from './hooks/useHeartbeat'

/**
 * 封解Box - メインアプリケーション
 * React + HeroUI Edition
 */
function App() {
    // Setup auto token refresh
    useAutoTokenRefresh()
    // Setup heartbeat for online status tracking
    useHeartbeat()
    return (
        <Routes>
            {/* Auth callback - outside Layout */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Main app with Layout */}
            <Route path="/*" element={
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/sheets/:id" element={<SheetDetail />} />
                        <Route path="/ranking" element={<Ranking />} />
                        <Route path="/users" element={<UserList />} />

                        {/* Personal Settings - For all users */}
                        <Route path="/settings" element={<PersonalSettings />} />

                        {/* Admin Panel - Unified admin interface */}
                        <Route path="/admin" element={<AdminPanel />} />

                        {/* DevStudio - API Key Management */}
                        <Route path="/dev-studio" element={<DevStudio />} />

                        {/* Legacy admin routes - Redirect to AdminPanel with tab parameter */}
                        <Route path="/admin/rewards" element={<Navigate to="/admin?tab=settings" replace />} />
                        <Route path="/users" element={<Navigate to="/admin?tab=users" replace />} />
                        <Route path="/admin/backup" element={<Navigate to="/admin?tab=backup" replace />} />

                        {/* Tools */}
                        <Route path="/tools" element={<Tools />} />
                        <Route path="/tools/:id" element={<ToolEditor />} />
                    </Routes>
                </Layout>
            } />
        </Routes>
    )
}

export default App
