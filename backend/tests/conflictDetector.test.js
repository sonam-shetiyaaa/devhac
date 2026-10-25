const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeCascadingConflicts } = require('../src/engine/conflictDetector');

test('Cascade Detector: Identifies downstream missed connection when feeder flight cancelled', () => {
  const flight = {
    id: 'book-01',
    segment_order: 1,
    type: 'FLIGHT',
    title: 'IndiGo 6E-204 BLR to DEL',
    scheduled_departure: '2026-11-15T07:00:00',
    scheduled_arrival: '2026-11-15T09:45:00',
  };

  const train = {
    id: 'book-02',
    segment_order: 2,
    type: 'TRAIN',
    title: 'Vande Bharat 20978 NDLS to JP',
    scheduled_departure: '2026-11-15T15:00:00',
    scheduled_arrival: '2026-11-15T18:45:00',
  };

  const hotel = {
    id: 'book-03',
    segment_order: 3,
    type: 'HOTEL',
    title: 'ITC Rajputana Jaipur',
    scheduled_departure: '2026-11-15T19:30:00',
    scheduled_arrival: '2026-11-18T11:00:00',
  };

  const allBookings = [flight, train, hotel];
  const disruption = {
    disruption_type: 'FLIGHT_CANCELLATION',
    delay_minutes: 720,
    description: 'Technical maintenance cancellation',
  };

  const result = analyzeCascadingConflicts(flight, allBookings, disruption, { min_connection_buffer_mins: 90 });

  assert.equal(result.conflictCount, 2, 'Should flag both connecting train and hotel as impacted');
  assert.equal(result.impactedBookings[0].issueType, 'MISSED_CONNECTION');
  assert.equal(result.impactedBookings[0].bookingId, 'book-02');
  assert.equal(result.impactedBookings[1].issueType, 'HOTEL_CHECKIN_THREAT');
});

test('Cascade Detector: Detects tight connection buffer risk on delay', () => {
  const flight = {
    id: 'book-01',
    segment_order: 1,
    type: 'FLIGHT',
    title: 'Flight A',
    scheduled_departure: '2026-11-15T08:00:00',
    scheduled_arrival: '2026-11-15T10:00:00',
  };

  const train = {
    id: 'book-02',
    segment_order: 2,
    type: 'TRAIN',
    title: 'Train B',
    scheduled_departure: '2026-11-15T11:45:00', // 105 mins buffer originally
    scheduled_arrival: '2026-11-15T15:00:00',
  };

  const allBookings = [flight, train];
  // 30 minute delay reduces buffer to 75 mins (< 90 mins required)
  const disruption = {
    disruption_type: 'FLIGHT_DELAY',
    delay_minutes: 30,
    description: 'Runway traffic delay',
  };

  const result = analyzeCascadingConflicts(flight, allBookings, disruption, { min_connection_buffer_mins: 90 });

  assert.equal(result.conflictCount, 1);
  assert.equal(result.impactedBookings[0].issueType, 'TIGHT_CONNECTION_RISK');
  assert.equal(result.impactedBookings[0].bufferAvailableMinutes, 75);
});
