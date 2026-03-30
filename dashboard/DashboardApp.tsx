import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { PatientsPage } from './pages/PatientsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FinancialPage } from './pages/FinancialPage';

export function DashboardApp() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/:id" element={<DoctorDetailPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="financial" element={<FinancialPage />} />
      </Route>
    </Routes>
  );
}
