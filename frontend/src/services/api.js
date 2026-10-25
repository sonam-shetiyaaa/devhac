// TripRescue AI - Dual-Mode Frontend API Client
// Connects seamlessly to remote Express backend (Localhost/Render/Railway)
// and autonomously falls back to the embedded browser engine on Vercel
// when no live backend is available.

import { localEngine } from './localEngine';

const CUSTOM_API_KEY = 'triprescue_custom_api_url';
let isBackendOnline = false;

export function getCustomApiUrl() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(CUSTOM_API_KEY) || '';
  }
  return '';
}

export function setCustomApiUrl(url) {
  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem(CUSTOM_API_KEY, url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem(CUSTOM_API_KEY);
    }
  }
}

function getBaseUrl() {
  const custom = getCustomApiUrl();
  if (custom) return `${custom}/api`;
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  return '/api';
}

export function getBackendStatus() {
  return {
    isOnline: isBackendOnline,
    baseUrl: getBaseUrl(),
    hasCustomUrl: !!getCustomApiUrl(),
  };
}

async function requestWithFallback(endpoint, options = {}, fallbackFn) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      isBackendOnline = true;
      return data;
    }
    // If not json (e.g. 404 HTML from Vercel), fall through to fallback
    throw new Error(`Server returned status ${res.status}`);
  } catch (err) {
    clearTimeout(timeoutId);
    isBackendOnline = false;
    // console.info(`[TripRescue Client] Remote API unavailable (${endpoint}), using resilient browser engine.`);
    if (fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

export async function fetchStatus() {
  return requestWithFallback(
    '/status',
    { method: 'GET' },
    () => ({
      success: true,
      ai: { mode: 'LOCAL_REASONING_CORE' },
      db: { connected: false, mode: 'BROWSER_RESILIENT_STORAGE' },
      mode: 'STANDALONE_VERCEL_DEMO',
      timestamp: new Date().toISOString(),
    })
  );
}

export async function fetchAllTrips() {
  return requestWithFallback(
    '/trips',
    { method: 'GET' },
    () => localEngine.getTrips()
  );
}

export async function fetchTripById(tripId) {
  return requestWithFallback(
    `/trips/${tripId}`,
    { method: 'GET' },
    () => localEngine.getTripById(tripId)
  );
}

export async function createNewTrip(tripData) {
  return requestWithFallback(
    '/trips',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tripData),
    },
    () => localEngine.createTrip(tripData)
  );
}

export async function addTripBooking(tripId, bookingData) {
  return requestWithFallback(
    `/trips/${tripId}/bookings`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    },
    () => localEngine.addBooking(tripId, bookingData)
  );
}

export async function reportTripDisruption(disruptionData) {
  return requestWithFallback(
    '/disruptions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disruptionData),
    },
    () => localEngine.reportDisruption(disruptionData)
  );
}

export async function previewDisruptionCascade(previewData) {
  return requestWithFallback(
    '/disruptions/preview',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(previewData),
    },
    () => localEngine.previewCascade(previewData)
  );
}

export async function analyzeTripRecovery(tripId) {
  return requestWithFallback(
    '/recovery/analyze',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId }),
    },
    () => localEngine.analyzeRecovery(tripId)
  );
}

export async function compareRelaxedConstraints(tripId, relaxedConstraints) {
  return requestWithFallback(
    '/recovery/compare',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId, relaxedConstraints }),
    },
    () => localEngine.compareRelaxed(tripId, relaxedConstraints)
  );
}

export async function confirmTripRecovery(tripId, optionId) {
  return requestWithFallback(
    '/recovery/confirm',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId, optionId }),
    },
    () => localEngine.confirmRecovery(tripId, optionId)
  );
}

export async function fetchRevisedItinerary(tripId) {
  return requestWithFallback(
    `/itinerary/${tripId}`,
    { method: 'GET' },
    () => localEngine.getRevisedItinerary(tripId)
  );
}

export async function toggleActionChecklistItem(tripId, actionId, completed) {
  return requestWithFallback(
    `/itinerary/${tripId}/actions/${actionId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    },
    () => localEngine.toggleAction(tripId, actionId, completed)
  );
}

export async function resetDemoScenario() {
  return requestWithFallback(
    '/demo/reset',
    { method: 'POST' },
    () => localEngine.resetDemo()
  );
}
