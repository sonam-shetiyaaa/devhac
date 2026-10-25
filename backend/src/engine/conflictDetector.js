// TripRescue AI - Whole-Trip Cascade Conflict Detector
// Analyzes upstream disruptions and determines multi-leg cascade failures across transport, hotels, and activities.

/**
 * Calculates cascading impacts across remaining bookings for a given disruption.
 * @param {Object} disruptedBooking - The booking directly reported as disrupted
 * @param {Array} allBookings - All travel bookings in the trip sorted by segment_order
 * @param {Object} disruptionInfo - Disruption payload (type, delay_minutes, updated_time, etc.)
 * @param {Object} constraints - Traveller preferences and constraints
 */
function analyzeCascadingConflicts(disruptedBooking, allBookings, disruptionInfo, constraints = {}) {
  const sortedBookings = [...allBookings].sort((a, b) => a.segment_order - b.segment_order);
  const minBufferMins = constraints?.min_connection_buffer_mins || 90;
  const preferredDeadline = constraints?.preferred_arrival_deadline ? new Date(constraints.preferred_arrival_deadline) : null;
  const criticalActivitiesStr = (constraints?.critical_activities || '').toLowerCase();

  const impactedBookings = [];
  const rootIndex = sortedBookings.findIndex(b => b.id === disruptedBooking.id);

  if (rootIndex === -1) {
    return {
      disruptedBooking,
      impactedBookings: [],
      conflictCount: 0,
      summary: 'Disrupted booking not found in trip itinerary.',
    };
  }

  const isCancellation = disruptionInfo.disruption_type.includes('CANCELLATION');
  const delayMinutes = parseInt(disruptionInfo.delay_minutes, 10) || 0;

  // Compute updated arrival of the disrupted segment
  let currentEstArrival;
  if (isCancellation) {
    // If cancelled and no alternative, arrival at transit point is indefinitely blocked
    currentEstArrival = null;
  } else {
    const plannedArrival = new Date(disruptedBooking.scheduled_arrival);
    currentEstArrival = new Date(plannedArrival.getTime() + delayMinutes * 60000);
  }

  // Iterate over all subsequent segments
  for (let i = rootIndex + 1; i < sortedBookings.length; i++) {
    const nextBooking = sortedBookings[i];
    const nextDep = nextBooking.scheduled_departure ? new Date(nextBooking.scheduled_departure) : null;
    const nextArr = nextBooking.scheduled_arrival ? new Date(nextBooking.scheduled_arrival) : null;

    let conflict = null;

    if (isCancellation) {
      // Complete cascade block
      if (nextBooking.type === 'TRAIN' || nextBooking.type === 'FLIGHT' || nextBooking.type === 'TRANSFER') {
        conflict = {
          bookingId: nextBooking.id,
          bookingTitle: nextBooking.title,
          type: nextBooking.type,
          provider: nextBooking.provider,
          cascadeLevel: i - rootIndex,
          severity: 'CRITICAL',
          issueType: 'MISSED_CONNECTION',
          scheduledTime: nextBooking.scheduled_departure,
          description: `Cannot catch ${nextBooking.title} because feeder flight ${disruptedBooking.reference_code} was cancelled.`,
          requiredAction: 'Requires rebooking on a subsequent train or rerouting directly to final destination.',
        };
      } else if (nextBooking.type === 'HOTEL') {
        conflict = {
          bookingId: nextBooking.id,
          bookingTitle: nextBooking.title,
          type: nextBooking.type,
          provider: nextBooking.provider,
          cascadeLevel: i - rootIndex,
          severity: 'HIGH',
          issueType: 'HOTEL_CHECKIN_THREAT',
          scheduledTime: nextBooking.scheduled_departure,
          description: `Hotel check-in at ${nextBooking.provider} will be missed or delayed until an alternative travel route is confirmed.`,
          requiredAction: 'Must notify hotel of delayed arrival window to prevent room no-show auto-cancellation.',
        };
      } else if (nextBooking.type === 'ACTIVITY') {
        const isCritical = criticalActivitiesStr && nextBooking.title.toLowerCase().includes(criticalActivitiesStr.slice(0, 10));
        conflict = {
          bookingId: nextBooking.id,
          bookingTitle: nextBooking.title,
          type: nextBooking.type,
          provider: nextBooking.provider,
          cascadeLevel: i - rootIndex,
          severity: isCritical ? 'CRITICAL' : 'MEDIUM',
          issueType: 'EVENT_JEOPARDIZED',
          scheduledTime: nextBooking.scheduled_departure,
          description: `Scheduled activity (${nextBooking.title}) cannot be attended at the planned time.`,
          requiredAction: isCritical
            ? 'Must prioritize recovery plans arriving before event gates close, or arrange immediate ticket rescheduling.'
            : 'Consider rescheduling or requesting customer credit.',
        };
      }
    } else {
      // Delay-based cascade
      if (nextBooking.type === 'TRAIN' || nextBooking.type === 'FLIGHT' || nextBooking.type === 'TRANSFER') {
        if (nextDep && currentEstArrival) {
          const bufferMillis = nextDep.getTime() - currentEstArrival.getTime();
          const bufferMinsAvailable = Math.round(bufferMillis / 60000);

          if (bufferMinsAvailable < 0) {
            conflict = {
              bookingId: nextBooking.id,
              bookingTitle: nextBooking.title,
              type: nextBooking.type,
              provider: nextBooking.provider,
              cascadeLevel: i - rootIndex,
              severity: 'CRITICAL',
              issueType: 'MISSED_CONNECTION',
              bufferAvailableMinutes: bufferMinsAvailable,
              minBufferRequiredMinutes: minBufferMins,
              description: `Connecting ${nextBooking.type.toLowerCase()} departs at ${nextDep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, but delayed arrival is estimated at ${currentEstArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${Math.abs(bufferMinsAvailable)} mins late).`,
              requiredAction: 'Must rebook onto a later departure or change route.',
            };
            // Subsequent travel times also slip
            currentEstArrival = null;
          } else if (bufferMinsAvailable < minBufferMins) {
            conflict = {
              bookingId: nextBooking.id,
              bookingTitle: nextBooking.title,
              type: nextBooking.type,
              provider: nextBooking.provider,
              cascadeLevel: i - rootIndex,
              severity: 'HIGH',
              issueType: 'TIGHT_CONNECTION_RISK',
              bufferAvailableMinutes: bufferMinsAvailable,
              minBufferRequiredMinutes: minBufferMins,
              description: `Tight connection window: only ${bufferMinsAvailable} minutes available between arrival and departure (minimum recommended buffer is ${minBufferMins} mins).`,
              requiredAction: 'High risk of missed transit if baggage retrieval or station transfer takes longer than expected.',
            };
          }
        }
      } else if (nextBooking.type === 'HOTEL') {
        const hotelArrival = currentEstArrival || new Date(nextBooking.scheduled_departure);
        const hours = hotelArrival.getHours();
        if (hours >= 21 || hours < 6) {
          conflict = {
            bookingId: nextBooking.id,
            bookingTitle: nextBooking.title,
            type: nextBooking.type,
            provider: nextBooking.provider,
            cascadeLevel: i - rootIndex,
            severity: 'MEDIUM',
            issueType: 'LATE_CHECKIN',
            description: `Estimated hotel arrival is after 21:00 (${hotelArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}). Standard desk policy may flag room as no-show.`,
            requiredAction: 'Notify hotel reception in advance with revised check-in time.',
          };
        }
      } else if (nextBooking.type === 'ACTIVITY') {
        const eventStart = new Date(nextBooking.scheduled_departure);
        if (currentEstArrival && (currentEstArrival.getTime() + 45 * 60000 > eventStart.getTime())) {
          conflict = {
            bookingId: nextBooking.id,
            bookingTitle: nextBooking.title,
            type: nextBooking.type,
            provider: nextBooking.provider,
            cascadeLevel: i - rootIndex,
            severity: 'CRITICAL',
            issueType: 'EVENT_MISSED',
            description: `Cannot reach venue before ${eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Transit time is insufficient.`,
            requiredAction: 'Reschedule activity booking to following morning/afternoon.',
          };
        }
      }
    }

    if (conflict) {
      impactedBookings.push(conflict);
    }
  }

  // Summary generation
  let summary = '';
  if (isCancellation) {
    summary = `Cancellation of ${disruptedBooking.title} directly breaks the entire remaining itinerary (${impactedBookings.length} dependent bookings impacted), including connecting transport, hotel check-in, and scheduled activities.`;
  } else if (impactedBookings.length > 0) {
    summary = `Delay of ${delayMinutes} minutes cascades to ${impactedBookings.length} subsequent booking(s), causing tight or missed connections downstream.`;
  } else {
    summary = 'Disruption is contained within safety buffers and does not invalidate connecting bookings.';
  }

  return {
    disruptedBooking,
    impactedBookings,
    conflictCount: impactedBookings.length,
    summary,
  };
}

module.exports = {
  analyzeCascadingConflicts,
};
