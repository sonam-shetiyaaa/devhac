// TripRescue AI - Standalone Client Engine & Browser Resilient Storage
// Provides autonomous multi-modal decision workflow, cascade calculation,
// 100-pt scoring engine, and persistent storage directly in the browser when
// deployed on static platforms like Vercel or when backend is sleeping.

const LOCAL_STORAGE_KEY = 'triprescue_local_store_v1';

const INITIAL_DEMO_DATA = {
  trips: [
    {
      id: 'trip-blr-jai-01',
      title: 'Bengaluru to Jaipur Cultural Conference & Heritage Tour',
      traveller_name: 'Rohan Mehta',
      origin: 'Bengaluru (BLR)',
      destination: 'Jaipur (JAI)',
      start_date: '2026-11-15T07:00:00',
      end_date: '2026-11-18T20:00:00',
      status: 'DISRUPTED',
      created_at: '2026-10-25T10:00:00',
      updated_at: '2026-10-25T10:15:00',
    },
    {
      id: 'trip-bom-goa-02',
      title: 'Mumbai to Goa Coastal Review & Leisure Retreat',
      traveller_name: 'Ananya Iyer',
      origin: 'Mumbai (BOM)',
      destination: 'Goa (GOI)',
      start_date: '2026-11-20T05:50:00',
      end_date: '2026-11-23T18:00:00',
      status: 'DISRUPTED',
      created_at: '2026-10-25T11:00:00',
      updated_at: '2026-10-25T11:30:00',
    },
    {
      id: 'trip-del-cok-03',
      title: 'Delhi to Kochi Spice Route & Backwaters Expedition',
      traveller_name: 'Vikram Malhotra',
      origin: 'New Delhi (DEL)',
      destination: 'Kochi (COK)',
      start_date: '2026-11-25T06:00:00',
      end_date: '2026-11-28T21:00:00',
      status: 'DISRUPTED',
      created_at: '2026-10-25T12:00:00',
      updated_at: '2026-10-25T12:30:00',
    }
  ],
  constraints: [
    {
      id: 'cons-blr-jai-01',
      trip_id: 'trip-blr-jai-01',
      max_additional_budget: 4500.0,
      preferred_arrival_deadline: '2026-11-15T21:00:00',
      min_connection_buffer_mins: 90,
      prefer_direct_transport: true,
      avoid_overnight_travel: false,
      critical_activities: 'Amber Fort Evening Sound & Light Show',
      notes: 'Must reach Jaipur before 21:00 to attend conference registration and Amber Fort event.'
    },
    {
      id: 'cons-bom-goa-02',
      trip_id: 'trip-bom-goa-02',
      max_additional_budget: 3500.0,
      preferred_arrival_deadline: '2026-11-20T17:30:00',
      min_connection_buffer_mins: 60,
      prefer_direct_transport: true,
      avoid_overnight_travel: true,
      critical_activities: 'Mandovi River Sunset Catamaran Cruise',
      notes: 'Sunset cruise boarding strictly closes at 17:40 PM at Panaji Jetty.'
    },
    {
      id: 'cons-del-cok-03',
      trip_id: 'trip-del-cok-03',
      max_additional_budget: 4000.0,
      preferred_arrival_deadline: '2026-11-25T13:00:00',
      min_connection_buffer_mins: 90,
      prefer_direct_transport: true,
      avoid_overnight_travel: false,
      critical_activities: 'Alleppey Luxury Houseboat Departure',
      notes: 'Houseboat departs Alleppey Finishing Point strictly at 13:00 PM.'
    }
  ],
  bookings: [
    // TRIP 1: BLR -> JAI
    {
      id: 'book-01-flight',
      trip_id: 'trip-blr-jai-01',
      segment_order: 1,
      type: 'FLIGHT',
      provider: 'IndiGo Airlines',
      reference_code: '6E-204',
      title: 'Flight 6E-204: Bengaluru (BLR) to New Delhi (DEL)',
      origin_station: 'Bengaluru Kempegowda (BLR)',
      destination_station: 'New Delhi Indira Gandhi T1 (DEL)',
      scheduled_departure: '2026-11-15T07:00:00',
      scheduled_arrival: '2026-11-15T09:45:00',
      cost: 5800.0,
      currency: 'INR',
      status: 'DISRUPTED',
      notes: 'Cancelled by carrier due to engine maintenance inspection.'
    },
    {
      id: 'book-02-train',
      trip_id: 'trip-blr-jai-01',
      segment_order: 2,
      type: 'TRAIN',
      provider: 'Indian Railways (Northern Railway)',
      reference_code: 'VB-20978',
      title: 'Vande Bharat Express: New Delhi (NDLS) to Jaipur Jn (JP)',
      origin_station: 'New Delhi Railway Station (NDLS)',
      destination_station: 'Jaipur Junction (JP)',
      scheduled_departure: '2026-11-15T15:00:00',
      scheduled_arrival: '2026-11-15T18:45:00',
      cost: 1650.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Connecting journey. Requires arrival in Delhi and transfer to station before 14:00.'
    },
    {
      id: 'book-03-hotel',
      trip_id: 'trip-blr-jai-01',
      segment_order: 3,
      type: 'HOTEL',
      provider: 'ITC Rajputana, A Luxury Collection Hotel',
      reference_code: 'ITC-JAI-8831',
      title: 'Hotel Stay: ITC Rajputana Deluxe Room (3 Nights)',
      origin_station: 'Palace Road, Jaipur',
      destination_station: 'Palace Road, Jaipur',
      scheduled_departure: '2026-11-15T19:30:00',
      scheduled_arrival: '2026-11-18T11:00:00',
      cost: 18500.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Standard check-in starts at 15:00. Arrivals after 21:00 require notice to avoid cancellation.'
    },
    {
      id: 'book-04-activity',
      trip_id: 'trip-blr-jai-01',
      segment_order: 4,
      type: 'ACTIVITY',
      provider: 'Rajasthan Tourism Dev Corp (RTDC)',
      reference_code: 'AMBER-EVE-44',
      title: 'Amber Fort Evening Sound & Light Show (English Show)',
      origin_station: 'Amber Fort, Devisinghpura, Jaipur',
      destination_station: 'Amber Fort, Devisinghpura, Jaipur',
      scheduled_departure: '2026-11-15T20:30:00',
      scheduled_arrival: '2026-11-15T21:45:00',
      cost: 950.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Critical activity. Non-refundable. Gates close strictly at 20:15.'
    },

    // TRIP 2: BOM -> GOA
    {
      id: 'book-201-train',
      trip_id: 'trip-bom-goa-02',
      segment_order: 1,
      type: 'TRAIN',
      provider: 'Indian Railways (Konkan Railway)',
      reference_code: 'TEJAS-22119',
      title: 'Tejas Express: Mumbai CSMT to Madgaon Jn (Goa)',
      origin_station: 'Mumbai CSMT',
      destination_station: 'Madgaon Junction (MAO)',
      scheduled_departure: '2026-11-20T05:50:00',
      scheduled_arrival: '2026-11-20T14:40:00',
      cost: 2150.0,
      currency: 'INR',
      status: 'DISRUPTED',
      notes: 'Delayed by 180 mins due to signal equipment failure near Ratnagiri.'
    },
    {
      id: 'book-202-transfer',
      trip_id: 'trip-bom-goa-02',
      segment_order: 2,
      type: 'TRANSFER',
      provider: 'Goa Tourism Prepaid Taxi',
      reference_code: 'GOA-CAB-114',
      title: 'Station Transfer: Madgaon Jn to Candolim North Goa',
      origin_station: 'Madgaon Junction',
      destination_station: 'Candolim, North Goa',
      scheduled_departure: '2026-11-20T15:00:00',
      scheduled_arrival: '2026-11-20T16:20:00',
      cost: 1400.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Connecting road transfer.'
    },
    {
      id: 'book-203-hotel',
      trip_id: 'trip-bom-goa-02',
      segment_order: 3,
      type: 'HOTEL',
      provider: 'Taj Fort Aguada Resort & Spa',
      reference_code: 'TAJ-GOA-774',
      title: 'Resort Stay: Taj Fort Aguada Sea View Cottage',
      origin_station: 'Sinquerim, Candolim, Goa',
      destination_station: 'Sinquerim, Candolim, Goa',
      scheduled_departure: '2026-11-20T16:30:00',
      scheduled_arrival: '2026-11-23T11:00:00',
      cost: 24500.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Standard check-in from 15:00 onwards.'
    },
    {
      id: 'book-204-activity',
      trip_id: 'trip-bom-goa-02',
      segment_order: 4,
      type: 'ACTIVITY',
      provider: 'Champions Yacht Club',
      reference_code: 'CRUISE-SUNSET-09',
      title: 'Mandovi River Sunset Catamaran VIP Cruise',
      origin_station: 'Panaji Jetty, Mandovi River',
      destination_station: 'Panaji Jetty, Mandovi River',
      scheduled_departure: '2026-11-20T18:00:00',
      scheduled_arrival: '2026-11-20T20:30:00',
      cost: 2800.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Boarding strictly closes at 17:40 PM. Non-refundable.'
    },

    // TRIP 3: DEL -> COK
    {
      id: 'book-301-flight',
      trip_id: 'trip-del-cok-03',
      segment_order: 1,
      type: 'FLIGHT',
      provider: 'Air India',
      reference_code: 'AI-512',
      title: 'Flight AI-512: New Delhi (DEL) to Kochi (COK)',
      origin_station: 'Indira Gandhi International T3 (DEL)',
      destination_station: 'Cochin International Airport (COK)',
      scheduled_departure: '2026-11-25T06:00:00',
      scheduled_arrival: '2026-11-25T09:15:00',
      cost: 6200.0,
      currency: 'INR',
      status: 'DISRUPTED',
      notes: 'Delayed by 240 mins due to severe morning dense fog ground-stop at IGI Airport.'
    },
    {
      id: 'book-302-transfer',
      trip_id: 'trip-del-cok-03',
      segment_order: 2,
      type: 'TRANSFER',
      provider: 'Kerala Gods Own Cabs',
      reference_code: 'KER-CAB-89',
      title: 'Airport Express Taxi: Kochi Airport to Alleppey Jetty',
      origin_station: 'Cochin Airport (COK)',
      destination_station: 'Alleppey Finishing Point Jetty',
      scheduled_departure: '2026-11-25T09:45:00',
      scheduled_arrival: '2026-11-25T11:45:00',
      cost: 2100.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Required road connection to catch the scheduled houseboat cruise.'
    },
    {
      id: 'book-303-hotel',
      trip_id: 'trip-del-cok-03',
      segment_order: 3,
      type: 'HOTEL',
      provider: 'Spice Routes Luxury Houseboats',
      reference_code: 'HB-KERALA-33',
      title: 'Private Premium Houseboat Cruise & Overnight Stay (Alleppey)',
      origin_station: 'Alleppey Backwaters, Kerala',
      destination_station: 'Alleppey Backwaters, Kerala',
      scheduled_departure: '2026-11-25T12:30:00',
      scheduled_arrival: '2026-11-26T09:30:00',
      cost: 16800.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Boat casts off strictly at 13:00 PM. No boarding after departure.'
    },
    {
      id: 'book-304-activity',
      trip_id: 'trip-del-cok-03',
      segment_order: 4,
      type: 'ACTIVITY',
      provider: 'Kerala Kathakali Centre Fort Kochi',
      reference_code: 'KATHA-EVE-12',
      title: 'Traditional Kathakali Classical Performance & Makeup Demo',
      origin_station: 'Fort Kochi Kathakali Centre',
      destination_station: 'Fort Kochi Kathakali Centre',
      scheduled_departure: '2026-11-25T18:30:00',
      scheduled_arrival: '2026-11-25T20:30:00',
      cost: 800.0,
      currency: 'INR',
      status: 'IMPACTED',
      notes: 'Evening performance.'
    }
  ],
  disruptions: [
    {
      id: 'disrupt-blr-jai-01',
      trip_id: 'trip-blr-jai-01',
      booking_id: 'book-01-flight',
      disruption_type: 'FLIGHT_CANCELLATION',
      severity: 'CRITICAL',
      planned_time: '2026-11-15T07:00:00',
      updated_time: '2026-11-15T07:00:00',
      delay_minutes: 720,
      description: 'IndiGo flight 6E-204 from BLR to DEL scheduled at 07:00 AM cancelled at 05:15 AM due to unscheduled technical aircraft maintenance. No automatic rebooking provided at counter.',
      reported_at: '2026-10-25T10:15:00'
    },
    {
      id: 'disrupt-bom-goa-02',
      trip_id: 'trip-bom-goa-02',
      booking_id: 'book-201-train',
      disruption_type: 'TRAIN_DELAY',
      severity: 'HIGH',
      planned_time: '2026-11-20T05:50:00',
      updated_time: '2026-11-20T08:50:00',
      delay_minutes: 180,
      description: 'Tejas Express 22119 halted near Ratnagiri due to automated signal system breakdown. Delay estimated at 3 hours, pushing Madgaon arrival past 17:40 PM.',
      reported_at: '2026-10-25T11:30:00'
    },
    {
      id: 'disrupt-del-cok-03',
      trip_id: 'trip-del-cok-03',
      booking_id: 'book-301-flight',
      disruption_type: 'FLIGHT_DELAY',
      severity: 'CRITICAL',
      planned_time: '2026-11-25T06:00:00',
      updated_time: '2026-11-25T10:00:00',
      delay_minutes: 240,
      description: 'Dense morning fog at Delhi IGI Airport triggered low visibility procedures. Flight AI-512 held on ground for 4 hours, missing the Alleppey Houseboat 13:00 cast-off.',
      reported_at: '2026-10-25T12:30:00'
    }
  ],
  recovery_options: [],
  revised_itineraries: []
};

function getLocalStore() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[TripRescue LocalEngine] Failed to read localStorage, using default data:', e);
  }
  return JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
}

function saveLocalStore(data) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('[TripRescue LocalEngine] Failed to save localStorage:', e);
  }
}

// Conflict Detector
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

  const isCancellation = (disruptionInfo.disruption_type || '').includes('CANCELLATION');
  const delayMinutes = parseInt(disruptionInfo.delay_minutes, 10) || 0;

  let currentEstArrival;
  if (isCancellation) {
    currentEstArrival = null;
  } else {
    const plannedArrival = new Date(disruptedBooking.scheduled_arrival);
    currentEstArrival = new Date(plannedArrival.getTime() + delayMinutes * 60000);
  }

  for (let i = rootIndex + 1; i < sortedBookings.length; i++) {
    const nextBooking = sortedBookings[i];
    const nextDep = nextBooking.scheduled_departure ? new Date(nextBooking.scheduled_departure) : null;
    const nextArr = nextBooking.scheduled_arrival ? new Date(nextBooking.scheduled_arrival) : null;

    let conflict = null;

    if (isCancellation) {
      if (nextBooking.type === 'TRAIN' || nextBooking.type === 'FLIGHT' || nextBooking.type === 'TRANSFER') {
        conflict = {
          bookingId: nextBooking.id,
          bookingTitle: nextBooking.title,
          type: nextBooking.type,
          provider: nextBooking.provider,
          cascadeLevel: i - rootIndex,
          severity: 'CRITICAL',
          issueType: 'MISSED_CONNECTION',
          description: `Cannot connect to ${nextBooking.title}: Upstream journey leg was cancelled.`,
          bufferViolationMins: 999,
        };
      } else if (nextBooking.type === 'HOTEL') {
        conflict = {
          bookingId: nextBooking.id,
          bookingTitle: nextBooking.title,
          type: nextBooking.type,
          provider: nextBooking.provider,
          cascadeLevel: i - rootIndex,
          severity: 'HIGH',
          issueType: 'CHECKIN_DEADLINE_RISK',
          description: `Late check-in or no-show forfeit risk at ${nextBooking.title}.`,
          bufferViolationMins: 0,
        };
      } else if (nextBooking.type === 'ACTIVITY') {
        const isCritical = criticalActivitiesStr && nextBooking.title.toLowerCase().includes(criticalActivitiesStr);
        conflict = {
          bookingId: nextBooking.id,
          bookingTitle: nextBooking.title,
          type: nextBooking.type,
          provider: nextBooking.provider,
          cascadeLevel: i - rootIndex,
          severity: isCritical ? 'CRITICAL' : 'HIGH',
          issueType: isCritical ? 'CRITICAL_ACTIVITY_MISSED' : 'EVENT_MISSED',
          description: `Scheduled activity '${nextBooking.title}' will be completely missed without alternative transport.`,
          bufferViolationMins: 0,
        };
      }
    } else if (currentEstArrival && nextDep) {
      const bufferMs = nextDep.getTime() - currentEstArrival.getTime();
      const bufferMins = Math.round(bufferMs / 60000);

      if (bufferMins < minBufferMins) {
        let issueType = 'BUFFER_VIOLATION';
        let severity = 'MEDIUM';

        if (bufferMins < 0) {
          issueType = 'MISSED_CONNECTION';
          severity = 'CRITICAL';
        } else if (bufferMins < 30) {
          severity = 'HIGH';
        }

        conflict = {
          bookingId: nextBooking.id,
          bookingTitle: nextBooking.title,
          type: nextBooking.type,
          provider: nextBooking.provider,
          cascadeLevel: i - rootIndex,
          severity,
          issueType,
          description: bufferMins < 0
            ? `Connection missed: Arrival at ${currentEstArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} is after departure at ${nextDep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
            : `Insufficient transit buffer: Only ${bufferMins} minutes available (Minimum required: ${minBufferMins} mins).`,
          bufferViolationMins: minBufferMins - bufferMins,
        };
      }

      if (nextArr) {
        const estNextArr = new Date(nextArr.getTime() + Math.max(0, -bufferMins + 30) * 60000);
        currentEstArrival = estNextArr;
      }
    }

    if (conflict) {
      impactedBookings.push(conflict);
    }
  }

  return {
    disruptedBooking,
    impactedBookings,
    conflictCount: impactedBookings.length,
    summary: `${impactedBookings.length} cascading impact(s) detected across subsequent travel, accommodation, and activity bookings.`,
  };
}

// Alternatives Generator
function generateAlternativesForDisruption(trip, disruption, constraints) {
  const tripId = trip?.id || '';
  const origin = trip?.origin || 'Origin';
  const destination = trip?.destination || 'Destination';
  const maxBudget = parseFloat(constraints?.max_additional_budget) || 5000;
  const criticalAct = constraints?.critical_activities || 'Key Scheduled Event';
  const startDate = trip?.start_date ? new Date(trip.start_date) : new Date();

  if (tripId === 'trip-blr-jai-01' || (origin.toLowerCase().includes('blr') && destination.toLowerCase().includes('jai'))) {
    return [
      {
        id: `rec-opt-a-${tripId}`,
        option_code: 'OPT-A',
        title: 'Priority Direct Re-route: Air India AI-840 (Direct BLR → JAI)',
        transport_type: 'FLIGHT (DIRECT)',
        provider: 'Air India',
        route_summary: 'Bengaluru (BLR) → Jaipur (JAI) [Direct Flight]',
        departure_time: '2026-11-15T11:15:00',
        arrival_time: '2026-11-15T13:45:00',
        total_cost: 9000.0,
        additional_cost: 3200.0,
        stops: 0,
        availability_status: 'Available (4 seats in Economy)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Complete Whole-Trip Recovery: Bypasses Delhi connection altogether. Arrives in Jaipur at 13:45 PM (5 hours ahead of original schedule). Train ticket can be refunded, hotel check-in is early/relaxed, and Amber Fort evening tour is 100% preserved.',
        advantages: [
          'Direct non-stop flight eliminating transit risk in Delhi',
          'Arrives safely at 13:45 PM, well ahead of the 21:00 deadline',
          'Preserves Amber Fort Evening Show at 20:30 without reschedule',
          'Additional cost of ₹3,200 is within the ₹4,500 budget limit',
          'Eligible for ₹1,650 refund on unused Vande Bharat train ticket'
        ],
        disadvantages: [
          '₹3,200 out-of-pocket payment required before airline claim reimbursement'
        ],
        justification: 'Recommended as the optimal whole-trip recovery: it bypasses the broken Delhi transit entirely, gets the traveller to Jaipur 5 hours early, and protects both hotel check-in and the critical evening cultural event within traveller budget.'
      },
      {
        id: `rec-opt-b-${tripId}`,
        option_code: 'OPT-B',
        title: 'Protected Connection: Vistara UK-812 + Evening Shatabdi Express 12015',
        transport_type: 'FLIGHT + TRAIN (MULTIMODAL)',
        provider: 'Vistara & Indian Railways',
        route_summary: 'BLR → DEL (Flight) + Delhi → Jaipur (Evening Shatabdi Train)',
        departure_time: '2026-11-15T09:30:00',
        arrival_time: '2026-11-15T22:40:00',
        total_cost: 7600.0,
        additional_cost: 1800.0,
        stops: 1,
        availability_status: 'Available (Executive & AC Chair Car)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Partial Cascade Recovery: Replaces flight to Delhi with Vistara UK-812 (lands 12:15). Provides 5h 35m transfer window to catch Evening Shatabdi 12015 at 17:50 PM. However, arrival in Jaipur is 22:40 PM, causing the Amber Fort show to be missed and requiring late check-in at ITC Rajputana.',
        advantages: [
          'Moderate additional cost of only ₹1,800',
          'Generous 5.5 hour connection buffer eliminates transfer stress in Delhi',
          'Retains railway scenic travel leg into Jaipur'
        ],
        disadvantages: [
          'Arrives at 22:40 PM (after preferred 21:00 deadline)',
          'Amber Fort 20:30 PM show is missed and must be rescheduled',
          'Requires alerting hotel reception of late check-in past 22:00'
        ],
        justification: 'Viable secondary alternative for budget-conscious travellers willing to sacrifice the evening cultural activity to save ₹1,400.'
      },
      {
        id: `rec-opt-c-${tripId}`,
        option_code: 'OPT-C',
        title: 'Economy Reroute: Afternoon Flight + Intercity AC Electric Sleeper Coach',
        transport_type: 'FLIGHT + BUS (MULTIMODAL)',
        provider: 'SpiceJet & Zingbus Intercity',
        route_summary: 'BLR → DEL (Flight SG-192) + Delhi Dhaula Kuan → Jaipur (Express Highway Coach)',
        departure_time: '2026-11-15T13:00:00',
        arrival_time: '2026-11-15T23:15:00',
        total_cost: 6400.0,
        additional_cost: 600.0,
        stops: 1,
        availability_status: 'Available (High capacity)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Budget Priority Recovery: Minimizes extra cash outlay to only ₹600. However, arrival is delayed to 23:15 PM. Breaks evening events, causes late arrival fatigue, and risks highway traffic delays.',
        advantages: [
          'Lowest additional cost: only ₹600 additional spending',
          'Leaves Bengaluru at a relaxed afternoon time (13:00 PM)'
        ],
        disadvantages: [
          'Late arrival at 23:15 PM breaches the 21:00 arrival constraint',
          'Amber Fort evening event missed',
          'Transfer from Terminal 3 to highway pickup point involves road cab',
          'Higher travel fatigue'
        ],
        justification: 'Suitable only if the traveller explicitly prioritizes budget minimization above all other constraints.'
      }
    ];
  }

  if (tripId === 'trip-bom-goa-02' || (origin.toLowerCase().includes('bom') && destination.toLowerCase().includes('goa'))) {
    return [
      {
        id: `rec-opt-a-${tripId}`,
        option_code: 'OPT-A',
        title: 'Air Switch Reroute: IndiGo 6E-618 (Mumbai T2 → Goa Mopa GOX)',
        transport_type: 'FLIGHT (AIR TRANSFER)',
        provider: 'IndiGo Airlines',
        route_summary: 'Mumbai (BOM) → Goa North (GOX) [Direct Flight] + Express Cab to Candolim',
        departure_time: '2026-11-20T11:30:00',
        arrival_time: '2026-11-20T14:15:00',
        total_cost: 4800.0,
        additional_cost: 2600.0,
        stops: 0,
        availability_status: 'Available (6 seats left)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Flawless Recovery: Bypasses the 3-hour railway signal block in Konkan Railway. Arrives at Taj Fort Aguada by 14:15 PM. Preserves Mandovi River Sunset Catamaran Cruise at 18:00 without delay.',
        advantages: [
          'Arrives in Goa 3.5 hours earlier than the delayed train',
          '100% guarantees participation in the Mandovi Sunset Cruise',
          'Relaxes hotel check-in at Taj Fort Aguada',
          'Well within the ₹3,500 additional budget'
        ],
        disadvantages: [
          'Requires cab transit to Mumbai International Airport Terminal 2'
        ],
        justification: 'Top recommendation: Salvages the entire weekend experience and client cruise for an incremental cost of ₹2,600.'
      },
      {
        id: `rec-opt-b-${tripId}`,
        option_code: 'OPT-B',
        title: 'Highway Express: Multi-Axle Scania AC Sleeper Coach',
        transport_type: 'INTERCITY BUS',
        provider: 'Paulo Travels Executive',
        route_summary: 'Mumbai Borivali → Panaji Bus Terminus (Direct Highway Coach)',
        departure_time: '2026-11-20T08:30:00',
        arrival_time: '2026-11-20T18:30:00',
        total_cost: 2200.0,
        additional_cost: 800.0,
        stops: 2,
        availability_status: 'Available (Upper Single Berths)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Partial Recovery: Reaches Panaji at 18:30 PM. Misses the 18:00 sunset cruise departure. Preserves hotel stay with standard evening check-in.',
        advantages: [
          'Low additional cost of only ₹800',
          'Pickups from multiple Mumbai hubs'
        ],
        disadvantages: [
          'Arrives after 18:00; Mandovi River sunset cruise is forfeited',
          '10 hours of highway travel fatigue'
        ],
        justification: 'Secondary option for travelers prioritizing budget over the evening cruise.'
      },
      {
        id: `rec-opt-c-${tripId}`,
        option_code: 'OPT-C',
        title: 'Stay on Delayed Tejas Express + Expedited Highway Station Cab',
        transport_type: 'TRAIN + TAXI',
        provider: 'Indian Railways & Local Prepaid Taxi',
        route_summary: 'Continue on Delayed Tejas Train to Madgaon Jn + Fast Highway Taxi',
        departure_time: '2026-11-20T05:50:00',
        arrival_time: '2026-11-20T19:15:00',
        total_cost: 1650.0,
        additional_cost: 0.0,
        stops: 3,
        availability_status: 'Confirmed Seat in Coach C4',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Heavy Cascaded Compromise: Train arrives Madgaon at 17:40 PM. With 90 min road transit to North Goa, hotel arrival is delayed to 19:15 PM. Sunset cruise is completely missed.',
        advantages: [
          'Zero additional expense (utilizes original ticket)'
        ],
        disadvantages: [
          'Loss of ₹2,400 non-refundable Sunset Cruise ticket',
          'Arrives tired after dark past 19:15 PM'
        ],
        justification: 'Cost-free alternative, but fails to prevent downstream event loss.'
      }
    ];
  }

  if (tripId === 'trip-del-cok-03' || (origin.toLowerCase().includes('del') && destination.toLowerCase().includes('cok'))) {
    return [
      {
        id: `rec-opt-a-${tripId}`,
        option_code: 'OPT-A',
        title: 'Morning Non-stop Priority: Vistara UK-883 (DEL → COK Direct)',
        transport_type: 'FLIGHT (DIRECT)',
        provider: 'Vistara Airlines',
        route_summary: 'New Delhi (DEL T3) → Kochi (COK) [Direct Flight] + Jetty Express Taxi',
        departure_time: '2026-11-25T07:45:00',
        arrival_time: '2026-11-25T11:00:00',
        total_cost: 8200.0,
        additional_cost: 2900.0,
        stops: 0,
        availability_status: 'Available (3 seats in Premium Economy/Economy)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Critical Cascade Saved: Lands in Kochi at 11:00 AM. Arrives at Alleppey Finishing Point Jetty by 12:30 PM. The luxury houseboat departure at 13:00 PM is 100% saved!',
        advantages: [
          'Protects the ₹16,000 non-refundable Alleppey private houseboat departure',
          'Arrives in Kochi safely at 11:00 AM before afternoon congestion',
          'Preserves evening Kathakali cultural show in Fort Kochi',
          'Within ₹4,000 additional budget'
        ],
        disadvantages: [
          'Requires immediate re-ticketing at Terminal 3'
        ],
        justification: 'Vital recovery: missing the 13:00 houseboat departure forces complete boat cancellation. This option preserves the entire backwaters retreat.'
      },
      {
        id: `rec-opt-b-${tripId}`,
        option_code: 'OPT-B',
        title: 'Connecting Flight via Bengaluru: IndiGo 6E-2115 + 6E-442',
        transport_type: 'FLIGHT (1-STOP)',
        provider: 'IndiGo Airlines',
        route_summary: 'DEL → BLR (Layover 75m) → Kochi (COK)',
        departure_time: '2026-11-25T08:15:00',
        arrival_time: '2026-11-25T14:45:00',
        total_cost: 6700.0,
        additional_cost: 1400.0,
        stops: 1,
        availability_status: 'Available (Economy)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Houseboat Lost / Land Reroute Required: Arrives at Kochi at 14:45 PM. Misses 13:00 houseboat cruise. Requires moving night 1 stay to a mainland resort in Kumarakom.',
        advantages: [
          'Low additional cost of ₹1,400',
          'Still arrives in Kerala on the same afternoon'
        ],
        disadvantages: [
          'Alleppey Houseboat day cruise missed (anchors at 13:00)',
          'Requires hotel booking modification'
        ],
        justification: 'Feasible secondary choice if traveller is willing to stay at a land resort instead of the cruise.'
      },
      {
        id: `rec-opt-c-${tripId}`,
        option_code: 'OPT-C',
        title: 'Next-Day Early Morning Flight: Air India AI-880 Direct',
        transport_type: 'FLIGHT (NEXT DAY)',
        provider: 'Air India',
        route_summary: 'New Delhi (DEL T3) → Kochi (COK) [Departs Tomorrow 06:15 AM]',
        departure_time: '2026-11-26T06:15:00',
        arrival_time: '2026-11-26T09:30:00',
        total_cost: 5300.0,
        additional_cost: 0.0,
        stops: 0,
        availability_status: 'Available via Carrier Free Reschedule',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Severe Disruption: Completely loses Day 1 of Kerala trip. Day 1 hotel night forfeited.',
        advantages: [
          'Zero fare cost under airline weather waiver'
        ],
        disadvantages: [
          'Arrives 24 hours late',
          'Day 1 accommodation and activities completely forfeited'
        ],
        justification: 'Only suitable for travelers with zero out-of-pocket budget flexibility.'
      }
    ];
  }

  // Dynamic Custom Route Generator
  const depTimeA = new Date(startDate.getTime() + 4 * 3600000);
  const arrTimeA = new Date(depTimeA.getTime() + 2.5 * 3600000);
  const depTimeB = new Date(startDate.getTime() + 2 * 3600000);
  const arrTimeB = new Date(depTimeB.getTime() + 6 * 3600000);
  const depTimeC = new Date(startDate.getTime() + 8 * 3600000);
  const arrTimeC = new Date(depTimeC.getTime() + 10 * 3600000);

  return [
    {
      id: `rec-opt-a-${Date.now()}`,
      option_code: 'OPT-A',
      title: `Priority Express: Direct Flight (${origin} → ${destination})`,
      transport_type: 'FLIGHT (DIRECT)',
      provider: 'National Air Carrier',
      route_summary: `${origin} → ${destination} [Non-stop Priority Route]`,
      departure_time: depTimeA.toISOString(),
      arrival_time: arrTimeA.toISOString(),
      total_cost: Math.round(maxBudget * 1.6),
      additional_cost: Math.round(maxBudget * 0.65),
      stops: 0,
      availability_status: 'Available (4 seats in Economy)',
      data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
      impact_on_connections: `Optimized Recovery: Direct connection from ${origin} to ${destination}. Arrives comfortably before downstream deadlines, protecting hotel reservation and "${criticalAct}".`,
      advantages: [
        `Direct non-stop service to ${destination}`,
        'Eliminates transit delays and missed connections',
        `Protects scheduled activity: ${criticalAct}`,
        `Within your additional budget limit of ₹${maxBudget.toLocaleString()}`
      ],
      disadvantages: [
        `Moderate fare difference of ₹${Math.round(maxBudget * 0.65).toLocaleString()}`
      ],
      justification: `Recommended as the fastest whole-trip recovery to reach ${destination} with minimal stress and zero secondary booking cancellations.`
    },
    {
      id: `rec-opt-b-${Date.now()}`,
      option_code: 'OPT-B',
      title: `Connecting Transit Route (${origin} → Transit Hub → ${destination})`,
      transport_type: 'FLIGHT + TRAIN (MULTIMODAL)',
      provider: 'Intercity Regional Transit',
      route_summary: `${origin} → Transit Hub → ${destination} [1 Transfer]`,
      departure_time: depTimeB.toISOString(),
      arrival_time: arrTimeB.toISOString(),
      total_cost: Math.round(maxBudget * 1.1),
      additional_cost: Math.round(maxBudget * 0.35),
      stops: 1,
      availability_status: 'Available (Standard Tier)',
      data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
      impact_on_connections: `Partial Recovery: Adds 1 intermediate stop. Arrives in ${destination} later in the evening, requiring late hotel check-in coordination.`,
      advantages: [
        `Economical alternative (only ₹${Math.round(maxBudget * 0.35).toLocaleString()} extra)`,
        'Reliable connection buffer'
      ],
      disadvantages: [
        'Requires platform/terminal transfer',
        `Arrives in ${destination} in the late evening`
      ],
      justification: 'Balanced trade-off between price and schedule integrity.'
    },
    {
      id: `rec-opt-c-${Date.now()}`,
      option_code: 'OPT-C',
      title: `Overnight Surface Express Sleeper (${origin} → ${destination})`,
      transport_type: 'SURFACE COACH (EXPRESS)',
      provider: 'National Express Lines',
      route_summary: `${origin} Highway Terminal → ${destination} Central`,
      departure_time: depTimeC.toISOString(),
      arrival_time: arrTimeC.toISOString(),
      total_cost: Math.round(maxBudget * 0.5),
      additional_cost: 0,
      stops: 2,
      availability_status: 'High Availability',
      data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
      impact_on_connections: `Budget Priority: Zero additional expense, but arrives late into night/morning. Day 1 events must be rescheduled.`,
      advantages: [
        'Zero extra out-of-pocket fare cost',
        'No immediate ticketing rush'
      ],
      disadvantages: [
        'Significantly extended journey duration',
        'Breaches daytime arrival preferences'
      ],
      justification: 'Best suited when out-of-pocket expenditure minimization is the highest priority.'
    }
  ];
}

// Scoring Engine
function scoreRecoveryOption(option, constraints, bookings, disruption) {
  const maxBudget = parseFloat(constraints?.max_additional_budget) || 5000.0;
  const deadline = constraints?.preferred_arrival_deadline ? new Date(constraints.preferred_arrival_deadline) : null;
  const criticalActivity = (constraints?.critical_activities || '').toLowerCase();

  const optDep = new Date(option.departure_time);
  const optArr = new Date(option.arrival_time);

  // 1. Timing & Arrival Score (35 pts max)
  let timeScore = 35;
  let timeExplanation = '';
  let deadlineViolated = false;

  if (deadline) {
    if (optArr.getTime() > deadline.getTime()) {
      deadlineViolated = true;
      const minsOver = Math.round((optArr.getTime() - deadline.getTime()) / 60000);
      const penalty = Math.min(25, Math.ceil(minsOver / 15) * 3);
      timeScore -= penalty;
      timeExplanation = `Arrives ${minsOver} mins after preferred deadline (${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) [-${penalty} pts]`;
    } else {
      const bufferMins = Math.round((deadline.getTime() - optArr.getTime()) / 60000);
      timeExplanation = `Arrives at ${optArr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${bufferMins} mins safely before ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} deadline.`;
    }
  } else {
    timeExplanation = `Estimated arrival at ${optArr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }

  if (optArr.getDate() !== optDep.getDate()) {
    timeScore -= 12;
    timeExplanation += ' (Arrives on the following day)';
  }
  timeScore = Math.max(0, Math.min(35, Math.round(timeScore)));

  // 2. Budget & Cost Score (25 pts max)
  const addCost = parseFloat(option.additional_cost) || 0.0;
  let budgetScore = 25;
  let budgetExplanation = '';
  let budgetViolated = false;

  if (addCost <= 0) {
    budgetScore = 25;
    budgetExplanation = 'Zero additional cost (no fare differential).';
  } else if (addCost <= maxBudget) {
    const costRatio = addCost / maxBudget;
    budgetScore = Math.round(25 * (1 - (costRatio * 0.6)));
    budgetExplanation = `Additional cost of ₹${addCost.toLocaleString()} is within the ₹${maxBudget.toLocaleString()} limit.`;
  } else {
    budgetViolated = true;
    const overBudget = addCost - maxBudget;
    const penalty = Math.min(25, 15 + Math.round((overBudget / maxBudget) * 10));
    budgetScore = Math.max(0, 25 - penalty);
    budgetExplanation = `Exceeds budget ceiling by ₹${overBudget.toLocaleString()} [-${penalty} pts].`;
  }

  // 3. Whole-Trip Cascade Impact Score (25 pts max)
  let cascadeScore = 25;
  const cascadeDetails = [];
  let activityPreserved = true;

  const hotelBooking = bookings.find(b => b.type === 'HOTEL');
  if (hotelBooking && hotelBooking.scheduled_departure) {
    const hotelDeadline = new Date(hotelBooking.scheduled_departure);
    if (optArr.getTime() > hotelDeadline.getTime() + 180 * 60000) {
      cascadeScore -= 8;
      cascadeDetails.push('Requires late hotel check-in alert (past standard window)');
    } else {
      cascadeDetails.push('Hotel reservation intact without penalty');
    }
  }

  const actBooking = bookings.find(b => b.type === 'ACTIVITY');
  if (actBooking && actBooking.scheduled_departure) {
    const actStart = new Date(actBooking.scheduled_departure);
    if (optArr.getTime() > actStart.getTime() - 60 * 60000) {
      activityPreserved = false;
      const isCritical = criticalActivity && actBooking.title.toLowerCase().includes(criticalActivity);
      const penalty = isCritical ? 15 : 8;
      cascadeScore -= penalty;
      cascadeDetails.push(`Misses scheduled activity '${actBooking.title}' [-${penalty} pts]`);
    } else {
      cascadeDetails.push(`Safely preserves '${actBooking.title}'`);
    }
  }

  cascadeScore = Math.max(0, Math.min(25, cascadeScore));

  // 4. Comfort & Modal Feasibility Score (15 pts max)
  let comfortScore = 15;
  let comfortExplanation = '';
  const stops = option.stops !== undefined ? option.stops : 0;

  if (stops === 0) {
    comfortScore = 15;
    comfortExplanation = 'Direct, non-stop journey with zero transfer fatigue.';
  } else if (stops === 1) {
    comfortScore = 10;
    comfortExplanation = '1 connection transfer required.';
  } else {
    comfortScore = 5;
    comfortExplanation = 'Multi-segment journey with high transfer fatigue.';
  }

  const totalScore = Math.min(100, Math.max(0, timeScore + budgetScore + cascadeScore + comfortScore));

  const relaxationOptions = [];
  if (budgetViolated) {
    relaxationOptions.push({
      type: 'RELAX_BUDGET',
      title: 'Increase Additional Budget Limit',
      description: `Increase your budget ceiling by ₹${(addCost - maxBudget).toLocaleString()} to unlock this fast recovery.`,
    });
  }
  if (deadlineViolated) {
    relaxationOptions.push({
      type: 'RELAX_DEADLINE',
      title: 'Extend Arrival Deadline',
      description: `Accept arrival at ${optArr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} instead of preferred ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });
  }
  if (!activityPreserved && criticalActivity) {
    relaxationOptions.push({
      type: 'RESCHEDULE_ACTIVITY',
      title: 'Reschedule Important Activity',
      description: `Move "${constraints.critical_activities}" to tomorrow morning at 09:30 AM.`,
    });
  }

  return {
    ...option,
    overall_score: totalScore,
    score_factors: {
      time: { score: timeScore, max: 35, explanation: timeExplanation },
      budget: { score: budgetScore, max: 25, explanation: budgetExplanation },
      cascade: { score: cascadeScore, max: 25, explanation: cascadeDetails.join('. ') },
      comfort: { score: comfortScore, max: 15, explanation: comfortExplanation },
    },
    constraints_audit: {
      isBudgetCompliant: !budgetViolated,
      isDeadlineCompliant: !deadlineViolated,
      isCriticalActivityPreserved: activityPreserved,
      relaxationOptions,
    },
  };
}

function evaluateAndRankOptions(options, constraints, bookings, disruption) {
  const scored = options.map(opt => scoreRecoveryOption(opt, constraints, bookings, disruption));
  scored.sort((a, b) => b.overall_score - a.overall_score);

  if (scored.length > 0) {
    scored.forEach((opt, idx) => {
      opt.is_recommended = idx === 0;
    });
  }

  return scored;
}

// AI Reasoning Agent
function generateFallbackExplanation(trip, disruption, cascadeAnalysis, scoredOptions, constraints) {
  const recommended = scoredOptions.find(o => o.is_recommended) || scoredOptions[0];
  const others = scoredOptions.filter(o => o.id !== recommended.id);
  const criticalAct = constraints?.critical_activities || 'your critical activity';
  const maxBudget = parseFloat(constraints?.max_additional_budget) || 5000;
  const deadlineStr = constraints?.preferred_arrival_deadline
    ? new Date(constraints.preferred_arrival_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'target arrival';

  const isBOM = trip.id === 'trip-bom-goa-02';
  const isDEL = trip.id === 'trip-del-cok-03';

  let execSummary = '';
  if (isBOM) {
    execSummary = `A severe signal equipment failure delayed your Tejas Express train by 3 hours. Left unaddressed, this railway delay would cause you to miss your station taxi transfer, delay your Taj Fort Aguada check-in, and cause forfeiture of your non-refundable Mandovi River Sunset Catamaran Cruise at 18:00 PM.`;
  } else if (isDEL) {
    execSummary = `Dense fog ground-stop procedures at Delhi Airport delayed flight AI-512 by 4 hours. Because the Alleppey private luxury houseboat departs the jetty strictly at 13:00 PM, this initial delay breaks your transfer and forces the forfeiture of your entire Day 1 backwaters retreat.`;
  } else {
    execSummary = `A primary journey disruption (${(disruption.disruption_type || 'DISRUPTION').replace(/_/g, ' ')}) has triggered a domino effect across your itinerary. Left unresolved, this cascade causes missed connections on subsequent transport legs, compromises hotel check-in times, and risks missing "${criticalAct}".`;
  }

  const whyRecommended = `TripRescue AI strongly recommends ${recommended.option_code} (${recommended.title}) with a decision score of ${recommended.overall_score}/100. Rather than waiting passively or accepting an uncoordinated delay, this recovery plan protects the whole journey. It reaches ${trip.destination} safely, protects your accommodation check-in, and preserves "${criticalAct}". The additional cost of ₹${recommended.additional_cost.toLocaleString()} sits comfortably inside your ₹${maxBudget.toLocaleString()} budget limit.`;

  const tradeOffs = others.map(opt => {
    return `• ${opt.option_code} (${opt.title} - Score: ${opt.overall_score}/100): While this saves out-of-pocket costs (extra expense ₹${opt.additional_cost.toLocaleString()}), it arrives late in ${trip.destination} at ${new Date(opt.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, which breaches your ${deadlineStr} arrival preference and compromises "${criticalAct}". It is suitable only if saving funds is your sole priority.`;
  }).join('\n\n');

  const constraintGuidance = recommended.constraints_audit?.isBudgetCompliant && recommended.constraints_audit?.isDeadlineCompliant
    ? 'All your core constraints (budget ceiling, arrival deadline, and critical activities) are fully satisfied by the recommended plan without requiring any trade-offs.'
    : `If you wish to choose lower-cost alternatives like Option B or C, you must relax the constraint on "${criticalAct}" and accept an evening or next-day arrival.`;

  return {
    source: 'TRIPRESCUE_REASONING_CORE',
    executiveSummary: execSummary,
    recommendedJustification: whyRecommended,
    tradeOffsAnalysis: tradeOffs,
    constraintGuidance,
  };
}

function buildRevisedItinerary(trip, selectedOption, existingBookings) {
  const isDirect = selectedOption.stops === 0;
  const revisedSchedule = [];

  // 1. Replacement travel segment
  revisedSchedule.push({
    segmentId: `rev-seg-01`,
    type: selectedOption.transport_type,
    provider: selectedOption.provider,
    title: selectedOption.title,
    referenceCode: selectedOption.option_code,
    originStation: trip.origin,
    destinationStation: trip.destination,
    departureTime: selectedOption.departure_time,
    arrivalTime: selectedOption.arrival_time,
    status: 'CONFIRMED_ALTERNATIVE',
    notes: `Approved whole-trip recovery segment connecting ${trip.origin} to ${trip.destination}.`,
    cost: selectedOption.total_cost,
  });

  // 2. Hotel segment
  const hotelBooking = existingBookings.find(b => b.type === 'HOTEL');
  const hotelName = hotelBooking?.provider || hotelBooking?.title || 'Destination Hotel & Resort';
  if (hotelBooking) {
    const isEarly = new Date(selectedOption.arrival_time).getHours() < 17;
    revisedSchedule.push({
      segmentId: `rev-seg-02`,
      type: 'HOTEL',
      provider: hotelBooking.provider || hotelName,
      title: hotelBooking.title || 'Accommodation Stay',
      referenceCode: hotelBooking.reference_code,
      originStation: hotelBooking.origin_station,
      destinationStation: hotelBooking.destination_station,
      departureTime: isEarly ? hotelBooking.scheduled_departure : '2026-11-20T21:00:00',
      arrivalTime: hotelBooking.scheduled_arrival,
      status: 'UPDATED',
      notes: isEarly
        ? 'Early arrival: Relaxed check-in available upon arrival.'
        : 'Late arrival: Hotel reception notified of revised check-in time.',
      cost: hotelBooking.cost,
    });
  }

  // 3. Activity segment
  const activityBooking = existingBookings.find(b => b.type === 'ACTIVITY');
  if (activityBooking) {
    const canMakeIt = new Date(selectedOption.arrival_time).getHours() < 17;
    revisedSchedule.push({
      segmentId: `rev-seg-03`,
      type: 'ACTIVITY',
      provider: activityBooking.provider || 'Tour Provider',
      title: activityBooking.title || 'Scheduled Event',
      referenceCode: activityBooking.reference_code,
      originStation: activityBooking.origin_station,
      destinationStation: activityBooking.destination_station,
      departureTime: canMakeIt ? activityBooking.scheduled_departure : 'Following Day',
      arrivalTime: canMakeIt ? activityBooking.scheduled_arrival : 'Following Day',
      status: canMakeIt ? 'PRESERVED' : 'RESCHEDULED',
      notes: canMakeIt
        ? 'Preserved at original scheduled slot.'
        : 'Rescheduled to following morning.',
      cost: activityBooking.cost,
    });
  }

  // 4. Checklist Actions
  const primaryTransport = existingBookings.find(b => b.type === 'FLIGHT' || b.type === 'TRAIN');
  const carrierName = primaryTransport?.provider || primaryTransport?.title || 'disrupted carrier';

  const actionsChecklist = [
    {
      id: 'act-01',
      title: `Book recommended travel segment (${selectedOption.title})`,
      category: 'BOOKING_ACTION',
      description: `Reserve your seat with ${selectedOption.provider} departing at ${new Date(selectedOption.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. (Fare: ₹${selectedOption.total_cost.toLocaleString()}).`,
      priority: 'HIGH',
      completed: false,
    },
    {
      id: 'act-02',
      title: `Claim full refund for cancelled ${carrierName} booking`,
      category: 'REFUND_ACTION',
      description: 'Submit an automated compensation claim with carrier reference to retrieve full ticket credit or reimbursement.',
      priority: 'HIGH',
      completed: false,
    },
    {
      id: 'act-03',
      title: isDirect
        ? 'Cancel or adjust intermediate transit reservations'
        : 'Confirm connecting transfer pickup time',
      category: 'TRANSIT_ACTION',
      description: isDirect
        ? 'Cancel unused connecting legs before departure to maximize your refund.'
        : 'Confirm platform or terminal pickup points.',
      priority: 'MEDIUM',
      completed: false,
    },
    {
      id: 'act-04',
      title: `Notify ${hotelName} of revised check-in schedule`,
      category: 'HOTEL_ACTION',
      description: `Alert front desk reception of your expected check-in time around ${new Date(selectedOption.arrival_time).getHours() + 1}:00. Reference booking ${hotelBooking?.reference_code || 'HTL-CONF'}.`,
      priority: 'MEDIUM',
      completed: false,
    },
    {
      id: 'act-05',
      title: `Verify ${activityBooking ? activityBooking.title : 'scheduled event'} booking`,
      category: 'ACTIVITY_ACTION',
      description: 'Confirm ticket status and venue admission requirements.',
      priority: 'LOW',
      completed: false,
    }
  ];

  return {
    summary: `Revised recovery plan confirmed using Option ${selectedOption.option_code} (${selectedOption.title}). Reached ${trip.destination} safely, healed whole-trip dependencies, and generated 5 actionable next steps.`,
    revised_schedule: revisedSchedule,
    remaining_conflicts: isDirect ? [] : ['Evening schedule adjusted to accommodate transit duration.'],
    actions_checklist: actionsChecklist,
  };
}

// Client Engine Public Interface
export const localEngine = {
  getTrips() {
    const store = getLocalStore();
    return { success: true, data: store.trips };
  },

  getTripById(id) {
    const store = getLocalStore();
    const trip = store.trips.find(t => t.id === id);
    if (!trip) return { success: false, error: 'Trip not found' };

    const constraints = store.constraints.find(c => c.trip_id === id) || null;
    const bookings = store.bookings.filter(b => b.trip_id === id).sort((a, b) => a.segment_order - b.segment_order);
    const disruptions = store.disruptions.filter(d => d.trip_id === id);
    const recoveryOptions = store.recovery_options.filter(r => r.trip_id === id);
    const revisedItinerary = store.revised_itineraries.find(i => i.trip_id === id) || null;

    return {
      success: true,
      data: {
        ...trip,
        constraints,
        bookings,
        disruptions,
        recoveryOptions,
        revisedItinerary,
      }
    };
  },

  createTrip(tripData) {
    const store = getLocalStore();
    const tripId = `trip-${Date.now()}`;
    const newTrip = {
      id: tripId,
      title: tripData.title,
      traveller_name: tripData.traveller_name,
      origin: tripData.origin,
      destination: tripData.destination,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      status: 'PLANNED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.trips.unshift(newTrip);

    if (tripData.constraints) {
      store.constraints.push({
        id: `cons-${Date.now()}`,
        trip_id: tripId,
        ...tripData.constraints,
      });
    }

    if (tripData.bookings && Array.isArray(tripData.bookings)) {
      tripData.bookings.forEach((b, idx) => {
        store.bookings.push({
          id: `book-${Date.now()}-${idx}`,
          trip_id: tripId,
          segment_order: idx + 1,
          currency: 'INR',
          status: 'CONFIRMED',
          ...b,
        });
      });
    }

    saveLocalStore(store);
    return { success: true, data: { tripId } };
  },

  addBooking(tripId, bookingData) {
    const store = getLocalStore();
    const existing = store.bookings.filter(b => b.trip_id === tripId);
    const newBooking = {
      id: `book-${Date.now()}`,
      trip_id: tripId,
      segment_order: existing.length + 1,
      currency: 'INR',
      status: 'CONFIRMED',
      ...bookingData,
    };
    store.bookings.push(newBooking);
    saveLocalStore(store);
    return { success: true, data: newBooking };
  },

  reportDisruption(payload) {
    const store = getLocalStore();
    const disruptionId = `disrupt-${Date.now()}`;
    const newDisruption = {
      id: disruptionId,
      trip_id: payload.trip_id,
      booking_id: payload.booking_id,
      disruption_type: payload.disruption_type,
      severity: payload.severity || 'HIGH',
      planned_time: payload.planned_time,
      updated_time: payload.updated_time,
      delay_minutes: payload.delay_minutes || 0,
      description: payload.description,
      reported_at: new Date().toISOString(),
    };

    store.disruptions = store.disruptions.filter(d => d.trip_id !== payload.trip_id);
    store.disruptions.push(newDisruption);

    const trip = store.trips.find(t => t.id === payload.trip_id);
    if (trip) {
      trip.status = 'DISRUPTED';
      trip.updated_at = new Date().toISOString();
    }

    const booking = store.bookings.find(b => b.id === payload.booking_id);
    if (booking) {
      booking.status = 'DISRUPTED';
    }

    saveLocalStore(store);
    return { success: true, data: newDisruption };
  },

  previewCascade(previewData) {
    const store = getLocalStore();
    const trip = store.trips.find(t => t.id === previewData.trip_id);
    const bookings = store.bookings.filter(b => b.trip_id === previewData.trip_id);
    const constraints = store.constraints.find(c => c.trip_id === previewData.trip_id) || {};
    const booking = bookings.find(b => b.id === previewData.booking_id) || bookings[0];

    const cascade = analyzeCascadingConflicts(booking, bookings, previewData, constraints);
    return { success: true, data: cascade };
  },

  analyzeRecovery(tripId) {
    const store = getLocalStore();
    const trip = store.trips.find(t => t.id === tripId);
    if (!trip) return { success: false, error: 'Trip not found' };

    const constraints = store.constraints.find(c => c.trip_id === tripId) || {};
    const bookings = store.bookings.filter(b => b.trip_id === tripId).sort((a, b) => a.segment_order - b.segment_order);
    const disruptions = store.disruptions.filter(d => d.trip_id === tripId);

    const primaryDisruption = disruptions[0] || {
      id: `disrupt-${Date.now()}`,
      trip_id: tripId,
      disruption_type: 'TRAVEL_DISRUPTION',
      delay_minutes: 180,
      description: 'Journey disruption detected.',
    };
    const primaryBooking = bookings.find(b => b.id === primaryDisruption.booking_id) || bookings[0] || {};

    const cascadeAnalysis = analyzeCascadingConflicts(primaryBooking, bookings, primaryDisruption, constraints);
    const rawAlternatives = generateAlternativesForDisruption(trip, primaryDisruption, constraints);
    const scoredOptions = evaluateAndRankOptions(rawAlternatives, constraints, bookings, primaryDisruption);

    // Save options to local store
    store.recovery_options = store.recovery_options.filter(r => r.trip_id !== tripId);
    scoredOptions.forEach(opt => {
      store.recovery_options.push({
        ...opt,
        trip_id: tripId,
        disruption_id: primaryDisruption.id,
      });
    });

    const aiExplanation = generateFallbackExplanation(trip, primaryDisruption, cascadeAnalysis, scoredOptions, constraints);
    saveLocalStore(store);

    return {
      success: true,
      data: {
        tripId,
        primaryDisruption,
        cascadeAnalysis,
        scoredOptions,
        aiExplanation,
      }
    };
  },

  compareRelaxed(tripId, relaxedConstraints) {
    const store = getLocalStore();
    const trip = store.trips.find(t => t.id === tripId);
    const origConstraints = store.constraints.find(c => c.trip_id === tripId) || {};
    const mergedConstraints = { ...origConstraints, ...relaxedConstraints };
    const bookings = store.bookings.filter(b => b.trip_id === tripId);
    const disruption = store.disruptions.find(d => d.trip_id === tripId) || {};
    const existingOptions = store.recovery_options.filter(r => r.trip_id === tripId);

    const scoredOptions = evaluateAndRankOptions(existingOptions, mergedConstraints, bookings, disruption);
    return {
      success: true,
      data: {
        tripId,
        relaxedConstraints: mergedConstraints,
        scoredOptions,
      }
    };
  },

  confirmRecovery(tripId, optionId) {
    const store = getLocalStore();
    const trip = store.trips.find(t => t.id === tripId);
    const bookings = store.bookings.filter(b => b.trip_id === tripId);
    const constraints = store.constraints.find(c => c.trip_id === tripId) || {};
    const option = store.recovery_options.find(r => r.id === optionId && r.trip_id === tripId)
      || store.recovery_options.find(r => r.id === optionId)
      || store.recovery_options[0];

    if (!option) return { success: false, error: 'Option not found' };

    const revisedItineraryData = buildRevisedItinerary(trip, option, bookings, constraints);
    const newItinerary = {
      id: `itin-${Date.now()}`,
      trip_id: tripId,
      disruption_id: option.disruption_id || null,
      selected_recovery_option_id: optionId,
      summary: revisedItineraryData.summary,
      revised_schedule: revisedItineraryData.revised_schedule,
      remaining_conflicts: revisedItineraryData.remaining_conflicts,
      actions_checklist: revisedItineraryData.actions_checklist,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    store.revised_itineraries = store.revised_itineraries.filter(i => i.trip_id !== tripId);
    store.revised_itineraries.push(newItinerary);

    if (trip) {
      trip.status = 'RECOVERED';
      trip.updated_at = new Date().toISOString();
    }

    saveLocalStore(store);
    return {
      success: true,
      data: {
        tripId,
        optionId,
        itinerary: newItinerary,
      }
    };
  },

  getRevisedItinerary(tripId) {
    const store = getLocalStore();
    const trip = store.trips.find(t => t.id === tripId);
    const itinerary = store.revised_itineraries.find(i => i.trip_id === tripId);
    if (!itinerary) return { success: false, error: 'No revised itinerary confirmed yet' };
    const selectedOption = store.recovery_options.find(r => r.id === itinerary.selected_recovery_option_id)
      || store.recovery_options[0]
      || null;

    return {
      success: true,
      data: {
        trip: trip || {
          id: tripId,
          title: 'Recovered Journey',
          traveller_name: 'Traveller',
          origin: '',
          destination: '',
        },
        itinerary,
        selectedOption,
      }
    };
  },

  toggleAction(tripId, actionId, completed) {
    const store = getLocalStore();
    const itinerary = store.revised_itineraries.find(i => i.trip_id === tripId);
    if (itinerary && Array.isArray(itinerary.actions_checklist)) {
      const act = itinerary.actions_checklist.find(a => a.id === actionId);
      if (act) {
        act.completed = completed;
        saveLocalStore(store);
      }
      return { success: true, data: itinerary.actions_checklist };
    }
    return { success: true, data: [] };
  },

  resetDemo() {
    const fresh = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    saveLocalStore(fresh);
    return { success: true, data: fresh };
  }
};
