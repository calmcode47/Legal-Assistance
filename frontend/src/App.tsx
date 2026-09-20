import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EmergencyTriage } from './pages/EmergencyTriage';
import { DocumentDemystifier } from './pages/DocumentDemystifier';
import { LegalAidLocator } from './pages/LegalAidLocator';
import { DemandLetterBuilder } from './pages/DemandLetterBuilder';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<EmergencyTriage />} />
          <Route path="/triage" element={<EmergencyTriage />} />
          <Route path="/analyze" element={<DocumentDemystifier />} />
          <Route path="/aid" element={<LegalAidLocator />} />
          <Route path="/action" element={<DemandLetterBuilder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
