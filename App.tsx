import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { PhoneFrame, BottomNav, RoleSwitcher } from './components/Layout';
import { Splash, Login, RoleSelect } from './features/Auth';
import { InboxScreen } from './features/Inbox';
import { ChatScreen, CallScreen } from './features/Chat';
import { AnamnesisWizard, AnamnesisView } from './features/Anamnesis';
import { SettingsScreen } from './features/Settings';
import { ConnectionRequests, DoctorProfile, DoctorDirectory } from './features/Doctor';
import { ConnectToDoctor } from './features/Patient';
import { useStore } from './store';
import { DashboardApp } from './dashboard/DashboardApp';

const demoMessages = [
  'გამარჯობა, ექიმო!',
  'როდის შემიძლია მოვიდე კონსულტაციაზე?',
  'გმადლობთ პასუხისთვის.',
  'ანალიზების შედეგები მზადაა.',
  'კარგად ვარ, მადლობა!',
  'მედიკამენტი დავიწყე მიღება.',
  'შემდეგ კვირას რა დღეს ხართ თავისუფალი?',
  'წნევა ნორმალიზდა.',
];

const ProtectedLayout = () => {
  const { currentUser, conversations, users, sendMessage, showNotification } = useStore();
  const location = useLocation();

  if (!currentUser) return <Navigate to="/auth/login" />;

  // F4 — Demo: simulate incoming messages every 45s
  useEffect(() => {
    const timer = setInterval(() => {
      const state = useStore.getState();
      if (!state.currentUser) return;
      const userConvs = state.conversations.filter(c =>
        (c.doctorUid === state.currentUser!.uid || c.patientUid === state.currentUser!.uid) && !c.isBlocked
      );
      if (userConvs.length === 0) return;

      const conv = userConvs[Math.floor(Math.random() * userConvs.length)];
      const partnerUid = state.currentUser!.role === 'patient' ? conv.doctorUid : conv.patientUid;
      const partner = state.users.find(u => u.uid === partnerUid);
      const partnerRole = partner?.role || 'patient';
      const msg = demoMessages[Math.floor(Math.random() * demoMessages.length)];

      state.sendMessage({
        conversationId: conv.id,
        senderUid: partnerUid,
        senderRole: partnerRole as any,
        type: 'text',
        content: msg,
      });

      // Show notification if not viewing that conversation
      const currentPath = window.location.hash;
      if (!currentPath.includes(`/chat/${conv.id}`)) {
        const senderName = partner?.displayName[state.language as 'ka'] || partner?.displayName.ka || '';
        state.showNotification(senderName, msg);
      }
    }, 45000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div key={location.pathname} className="flex-1 flex flex-col overflow-hidden animate-fade-in-scale">
        <Outlet />
      </div>
      <BottomNav />
      <RoleSwitcher />
    </>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Dashboard — desktop layout, no PhoneFrame */}
        <Route path="/dashboard/*" element={<DashboardApp />} />

        {/* Mobile app — original PhoneFrame layout */}
        <Route path="/*" element={
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
        } />
      </Routes>
    </HashRouter>
  );
}