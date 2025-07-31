import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSchool from './pages/RegisterSchool';
import RegisterSchoolMembers from './pages/RegisterSchoolMembers';
import Delegations from './pages/Delegations';
import Bills from './pages/Bills';
import MyBills from './pages/MyBills';
import CreateBill from './pages/CreateBill';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import Account from './pages/Account';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ 
  children, 
  adminOnly = false 
}) => {
  // useAuth must be called inside AuthProvider, so this component must be a child of AuthProvider
  // We'll move this logic to the route definitions below
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-school" element={<RegisterSchool />} />
              <Route path="/register-school-members" element={<RegisterSchoolMembers />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/create-bill" element={<CreateBill />} />
              <Route path="/my-bills" element={<MyBills />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/delegations" element={<Delegations />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
