const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRevisedItinerary, generateFallbackExplanation } = require('../src/engine/recoveryAgent');

test('Recovery Agent: Builds revised itinerary and required actions checklist', () => {
  const trip = {
    id: 'test-trip-01',
    title: 'BLR to JAI Trip',
    origin: 'Bengaluru (BLR)',
    destination: 'Jaipur (JAI)',
  };

  const selectedOption = {
    id: 'opt-rec-1',
    option_code: 'OPT-A',
    title: 'Air India AI-840 Direct',
    transport_type: 'FLIGHT',
    provider: 'Air India',
    departure_time: '2026-11-15T11:15:00',
    arrival_time: '2026-11-15T13:45:00',
    total_cost: 9000,
    additional_cost: 3200,
    stops: 0,
  };

  const existingBookings = [
    {
      id: 'b-flight',
      type: 'FLIGHT',
      title: 'IndiGo 6E-204',
      reference_code: '6E-204',
      cost: 5800,
    },
    {
      id: 'b-hotel',
      type: 'HOTEL',
      title: 'ITC Rajputana',
      reference_code: 'ITC-101',
      cost: 18500,
      scheduled_departure: '2026-11-15T19:30:00',
      scheduled_arrival: '2026-11-18T11:00:00',
    },
    {
      id: 'b-activity',
      type: 'ACTIVITY',
      title: 'Amber Fort Light Show',
      reference_code: 'ACT-99',
      cost: 950,
      scheduled_departure: '2026-11-15T20:30:00',
      scheduled_arrival: '2026-11-15T21:45:00',
    }
  ];

  const itinerary = buildRevisedItinerary(trip, selectedOption, existingBookings, {
    critical_activities: 'Amber Fort'
  });

  assert.ok(itinerary.summary.includes('Option OPT-A'));
  assert.equal(itinerary.revised_schedule.length, 3);
  assert.equal(itinerary.actions_checklist.length, 5);
  assert.ok(itinerary.actions_checklist.some(a => a.id === 'act-02' && a.title.includes('IndiGo')));
  assert.ok(itinerary.actions_checklist.some(a => a.id === 'act-04' && a.title.includes('ITC Rajputana')));
});
