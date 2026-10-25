// TripRescue AI - Frontend API Service Client

const API_BASE = '/api';

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function fetchAllTrips() {
  const res = await fetch(`${API_BASE}/trips`);
  if (!res.ok) throw new Error('Failed to fetch trips');
  return res.json();
}

export async function fetchTripById(tripId) {
  const res = await fetch(`${API_BASE}/trips/${tripId}`);
  if (!res.ok) throw new Error('Failed to fetch trip details');
  return res.json();
}

export async function createNewTrip(tripData) {
  const res = await fetch(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create trip');
  }
  return res.json();
}

export async function addTripBooking(tripId, bookingData) {
  const res = await fetch(`${API_BASE}/trips/${tripId}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add booking');
  }
  return res.json();
}

export async function reportTripDisruption(disruptionData) {
  const res = await fetch(`${API_BASE}/disruptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(disruptionData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to report disruption');
  }
  return res.json();
}

export async function previewDisruptionCascade(previewData) {
  const res = await fetch(`${API_BASE}/disruptions/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(previewData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to preview cascade');
  }
  return res.json();
}

export async function analyzeTripRecovery(tripId) {
  const res = await fetch(`${API_BASE}/recovery/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze recovery');
  }
  return res.json();
}

export async function compareRelaxedConstraints(tripId, relaxedConstraints) {
  const res = await fetch(`${API_BASE}/recovery/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId, relaxedConstraints }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to compare options');
  }
  return res.json();
}

export async function confirmTripRecovery(tripId, optionId) {
  const res = await fetch(`${API_BASE}/recovery/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId, optionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to confirm recovery');
  }
  return res.json();
}

export async function fetchRevisedItinerary(tripId) {
  const res = await fetch(`${API_BASE}/itinerary/${tripId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch itinerary');
  }
  return res.json();
}

export async function toggleActionChecklistItem(tripId, actionId, completed) {
  const res = await fetch(`${API_BASE}/itinerary/${tripId}/actions/${actionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update action');
  }
  return res.json();
}

export async function resetDemoScenario() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}
