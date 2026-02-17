import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PhoneFrame, BottomNav, RoleSwitcher } from './components/Layout';
import { Splash, Login, RoleSelect } from './features/Auth';
import { InboxScreen } from './features/Inbox';
import { ChatScreen, CallScreen } from './features/Chat';
import { AnamnesisWizard, AnamnesisView } from './features/Anamnesis';
import { SettingsScreen } from './features/Settings';
import { ConnectionRequests, DoctorProfile, DoctorDirectory } from './features/Doctor';
import { ConnectToDoctor } from './features/Patient';
import { useStore } from './store';

const ProtectedLayout = () => {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/auth/login" />;
  
  return (
    <>
      <Outlet />
      <BottomNav />
      <RoleSwitcher />
    </>
  );
};

export default function App() {
  return (
    <HashRouter>
      <PhoneFrame>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/role" element={<RoleSelect />} />
          
          <Route element={<ProtectedLayout />}>
            <Route path="/inbox" element={<InboxScreen />} />
            <Route path="/chat/:id" element={<ChatScreen />} />
            <Route path="/call-active" element={<CallScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            
            {/* Patient Routes */}
            <Route path="/anamnesis-wizard" element={<AnamnesisWizard />} />
            <Route path="/anamnesis-view" element={<AnamnesisView />} />
            <Route path="/connect" element={<ConnectToDoctor />} />
            
            {/* Doctor Routes */}
            <Route path="/requests" element={<ConnectionRequests />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/doctor-directory" element={<DoctorDirectory />} />
            <Route path="/patient-history/:uid" element={<AnamnesisView />} />
            <Route path="*" element={<Navigate to="/inbox" replace />} />
          </Route>
        </Routes>
      </PhoneFrame>
    </HashRouter>
  );
}