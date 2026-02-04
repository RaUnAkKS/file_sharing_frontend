import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ShareLinks from './pages/ShareLinks';
import ShareLinkDetails from './pages/ShareLinkDetails';
import PublicDownload from './pages/PublicDownload';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/shares" element={
              <PrivateRoute>
                <ShareLinks />
              </PrivateRoute>
            } />
            <Route path="/shares/:id" element={
              <PrivateRoute>
                <ShareLinkDetails />
              </PrivateRoute>
            } />

            {/* Public Routes */}
            <Route path="/share/download/:id" element={<PublicDownload />} />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
