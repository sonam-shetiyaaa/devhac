// In-memory and file-persistent storage for TripRescue AI
// Provides identical interface and semantics to MySQL tables

const fs = require('fs');
const path = require('path');

const STORE_FILE = path.resolve(__dirname, 'store.json');

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

class Store {
  constructor() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[TripRescue Store] Failed to load store.json, using default seed');
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[TripRescue Store] Failed to save store.json');
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    this.saveToFile();
    return this.data;
  }
}

const storeInstance = new Store();
module.exports = storeInstance;
