import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import TripDetailsPage from './pages/TripDetailsPage';
import ReportDisruptionPage from './pages/ReportDisruptionPage';
import RecoveryAnalysisPage from './pages/RecoveryAnalysisPage';
import RevisedItineraryPage from './pages/RevisedItineraryPage';

import {
  fetchAllTrips,
  fetchTripById,
  fetchStatus,
  createNewTrip,
  resetDemoScenario,
  reportTripDisruption,
  addTripBooking,
} from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState('trip-blr-jai-01');
  const [activeTrip, setActiveTrip] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStatus = async () => {
    try {
      const res = await fetchStatus();
      if (res.success) setSystemStatus(res);
    } catch (e) {
      console.warn('Backend status check failed:', e.message);
    }
  };

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await fetchAllTrips();
      if (res.success) {
        setTrips(res.data);
        if (res.data.length > 0) {
          const currentId = activeTripId || res.data[0].id;
          await loadTripDetails(currentId);
        }
      }
    } catch (e) {
      console.error('Failed to load trips:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTripDetails = async (id) => {
    try {
      const res = await fetchTripById(id);
      if (res.success) {
        setActiveTrip(res.data);
        setActiveTripId(id);
      }
    } catch (e) {
      console.error('Failed to load trip details:', e);
    }
  };

  useEffect(() => {
    loadStatus();
    loadTrips();
  }, []);

  const handleSelectTrip = async (id) => {
    await loadTripDetails(id);
    setActivePage('trip-details');
    showToast(`Loaded trip: ${id}`);
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await resetDemoScenario();
      await loadTrips();
      setActivePage('dashboard');
      showToast('Demo scenario (Bengaluru to Jaipur via Delhi) reset to initial disrupted state!');
    } catch (e) {
      showToast('Failed to reset demo: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReportDisruption = async (disruptionPayload) => {
    const res = await reportTripDisruption(disruptionPayload);
    await loadTripDetails(activeTripId);
    showToast('Disruption recorded! Multi-leg cascade computed.');
    return res;
  };

  const handleAddBooking = async (tripId, bookingData) => {
    const res = await addTripBooking(tripId, bookingData);
    await loadTripDetails(tripId);
    showToast('Travel segment added successfully.');
    return res;
  };

  const handleCreateTrip = async (tripPayload) => {
    const res = await createNewTrip(tripPayload);
    await loadTrips();
    if (res.data?.id) {
      await loadTripDetails(res.data.id);
    }
    showToast(`Created trip: ${tripPayload.title}`);
    return res;
  };

  const handlePlanConfirmed = async (itinerary) => {
    await loadTripDetails(activeTripId);
    showToast('Recovery plan approved! Revised itinerary ready.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-800">
      {/* Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        activeTripId={activeTripId}
        onResetDemo={handleResetDemo}
        systemStatus={systemStatus}
      />

      {/* Floating feedback toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 flex items-center space-x-2 animate-fade-in no-print">
          <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb strip */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <span
            className="cursor-pointer hover:text-slate-800"
            onClick={() => setActivePage('dashboard')}
          >
            Home
          </span>
          <span>/</span>
          <span className="font-semibold text-slate-800 capitalize">
            {activePage.replace('-', ' ')}
          </span>
          {activeTrip && (
            <>
              <span>/</span>
              <span className="text-slate-600 truncate max-w-xs">{activeTrip.title}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activePage === 'dashboard' && (
          <DashboardPage
            trips={trips}
            activeTrip={activeTrip}
            onSelectTrip={handleSelectTrip}
            onQuickSwitchTrip={loadTripDetails}
            onCreateTrip={handleCreateTrip}
            onNavigate={setActivePage}
            onLoadDemo={handleResetDemo}
            loading={loading}
          />
        )}

        {activePage === 'trip-details' && (
          <TripDetailsPage
            activeTrip={activeTrip}
            onAddBooking={handleAddBooking}
            onNavigate={setActivePage}
            loading={loading}
          />
        )}

        {activePage === 'report-disruption' && (
          <ReportDisruptionPage
            activeTrip={activeTrip}
            onReportDisruption={handleReportDisruption}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'recovery-analysis' && (
          <RecoveryAnalysisPage
            activeTrip={activeTrip}
            onNavigate={setActivePage}
            onPlanConfirmed={handlePlanConfirmed}
          />
        )}

        {activePage === 'revised-itinerary' && (
          <RevisedItineraryPage
            activeTrip={activeTrip}
            onNavigate={setActivePage}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
