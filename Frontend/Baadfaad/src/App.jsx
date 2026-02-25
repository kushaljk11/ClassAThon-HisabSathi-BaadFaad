import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing/Landing'
import AboutUs from './pages/landing/AboutUs'
import Contact from './pages/landing/Contact'
import Home from './pages/Dashboard/Home'
import CreateSplit from './pages/split/CreateSplit'
import ScanBill from './pages/split/ScanBill'
import ReadyToSplit from './pages/split/ReadyToSplit'
import JoinedParticipants from './pages/split/JoinedParticipants'
import SplitBreakdown from './pages/split/SplitBreakdown'
import SplitCalculated from './pages/split/SplitCalculated'
import Settlement from './pages/group/Settelment'
import Nudge from './pages/Group/Nudge'
import Group from './pages/Group/Group'
import Login from './pages/Auth/Login'
import JoinSession from './pages/Dashboard/JoinSession'
import JoinSplit from './pages/split/JoinSplit'
import AuthCallback from './pages/Auth/AuthCallback'
import { AuthProvider, useAuth } from './context/authContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import Loader from './components/common/Loader'

function AppContent() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader className="size-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/join-session" element={<ProtectedRoute><JoinSession /></ProtectedRoute>} />
        <Route path="/split/join" element={<ProtectedRoute><JoinSplit /></ProtectedRoute>} />
        <Route path="/split/create" element={<ProtectedRoute><CreateSplit /></ProtectedRoute>} />
        <Route path="/split/scan" element={<ProtectedRoute><ScanBill /></ProtectedRoute>} />
        <Route path="/split/ready" element={<ProtectedRoute><ReadyToSplit /></ProtectedRoute>} />
        <Route path="/split/joined" element={<ProtectedRoute><JoinedParticipants /></ProtectedRoute>} />
        <Route path="/split/breakdown" element={<ProtectedRoute><SplitBreakdown /></ProtectedRoute>} />
        <Route path="/split/calculated" element={<ProtectedRoute><SplitCalculated /></ProtectedRoute>} />
        <Route path="/split/settlement" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />
        <Route path="/group" element={<ProtectedRoute><Group /></ProtectedRoute>} />
        <Route path="/group/:groupId/settlement" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />
        <Route path="/group/:groupId/nudge" element={<ProtectedRoute><Nudge /></ProtectedRoute>} />
        <Route path="/group/details" element={<ProtectedRoute><Group /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
