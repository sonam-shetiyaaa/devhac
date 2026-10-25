-- TripRescue AI - Demonstration Seed Data
-- Features 3 Realistic Diverse Disruption Scenarios:
-- 1. Bengaluru -> Jaipur via Delhi (Flight cancellation -> Missed connecting train & evening tour)
-- 2. Mumbai -> Goa (Tejas Express 3-hour delay -> Missed catamaran sunset cruise)
-- 3. Delhi -> Kochi (Severe dense fog 4-hour delay -> Missed Alleppey private houseboat departure)

USE trip_rescue_db;

DELETE FROM revised_itineraries;
DELETE FROM recovery_options;
DELETE FROM disruptions;
DELETE FROM travel_bookings;
DELETE FROM traveller_constraints;
DELETE FROM trips;

-- =====================================================
-- 1. INSERT TRIPS
-- =====================================================
INSERT INTO trips (id, title, traveller_name, origin, destination, start_date, end_date, status) VALUES 
('trip-blr-jai-01', 'Bengaluru to Jaipur Cultural Conference & Heritage Tour', 'Rohan Mehta', 'Bengaluru (BLR)', 'Jaipur (JAI)', '2026-11-15 07:00:00', '2026-11-18 20:00:00', 'DISRUPTED'),
('trip-bom-goa-02', 'Mumbai to Goa Coastal Review & Leisure Retreat', 'Ananya Iyer', 'Mumbai (BOM)', 'Goa (GOI)', '2026-11-20 05:50:00', '2026-11-23 18:00:00', 'DISRUPTED'),
('trip-del-cok-03', 'Delhi to Kochi Spice Route & Backwaters Expedition', 'Vikram Malhotra', 'New Delhi (DEL)', 'Kochi (COK)', '2026-11-25 06:00:00', '2026-11-28 21:00:00', 'DISRUPTED');

-- =====================================================
-- 2. INSERT TRAVELLER CONSTRAINTS
-- =====================================================
INSERT INTO traveller_constraints (id, trip_id, max_additional_budget, preferred_arrival_deadline, min_connection_buffer_mins, prefer_direct_transport, avoid_overnight_travel, critical_activities, notes) VALUES
('cons-blr-jai-01', 'trip-blr-jai-01', 4500.00, '2026-11-15 21:00:00', 90, TRUE, FALSE, 'Amber Fort Evening Sound & Light Show', 'Must reach Jaipur before 21:00 to attend conference registration and Amber Fort event.'),
('cons-bom-goa-02', 'trip-bom-goa-02', 3500.00, '2026-11-20 17:30:00', 60, TRUE, TRUE, 'Mandovi River Sunset Catamaran Cruise', 'Sunset cruise boarding strictly closes at 17:40 PM at Panaji Jetty.'),
('cons-del-cok-03', 'trip-del-cok-03', 4000.00, '2026-11-25 13:00:00', 90, TRUE, FALSE, 'Alleppey Luxury Houseboat Departure', 'Houseboat departs Alleppey Finishing Point strictly at 13:00 PM.');

-- =====================================================
-- 3. INSERT TRAVEL BOOKINGS
-- =====================================================
INSERT INTO travel_bookings (id, trip_id, segment_order, type, provider, reference_code, title, origin_station, destination_station, scheduled_departure, scheduled_arrival, cost, currency, status, notes) VALUES
-- Trip 1 Bookings
('book-01-flight', 'trip-blr-jai-01', 1, 'FLIGHT', 'IndiGo Airlines', '6E-204', 'Flight 6E-204: Bengaluru (BLR) to New Delhi (DEL)', 'Bengaluru (BLR)', 'New Delhi (DEL)', '2026-11-15 07:00:00', '2026-11-15 09:45:00', 5800.00, 'INR', 'DISRUPTED', 'Cancelled by carrier due to engine maintenance inspection.'),
('book-02-train', 'trip-blr-jai-01', 2, 'TRAIN', 'Indian Railways (Northern Railway)', 'VB-20978', 'Vande Bharat Express: New Delhi to Jaipur Jn', 'New Delhi Railway Station (NDLS)', 'Jaipur Junction (JP)', '2026-11-15 15:00:00', '2026-11-15 18:45:00', 1650.00, 'INR', 'IMPACTED', 'Connecting journey. Requires arrival in Delhi and transfer to station before 14:00.'),
('book-03-hotel', 'trip-blr-jai-01', 3, 'HOTEL', 'ITC Rajputana, A Luxury Collection Hotel', 'ITC-JAI-8831', 'Hotel Stay: ITC Rajputana Deluxe Room (3 Nights)', 'Palace Road, Jaipur', 'Palace Road, Jaipur', '2026-11-15 19:30:00', '2026-11-18 11:00:00', 18500.00, 'INR', 'IMPACTED', 'Standard check-in starts at 15:00. Late arrivals require notice.'),
('book-04-activity', 'trip-blr-jai-01', 4, 'ACTIVITY', 'Rajasthan Tourism Dev Corp (RTDC)', 'AMBER-EVE-44', 'Amber Fort Evening Sound & Light Show (English Show)', 'Amber Fort, Jaipur', 'Amber Fort, Jaipur', '2026-11-15 20:30:00', '2026-11-15 21:45:00', 950.00, 'INR', 'IMPACTED', 'Critical activity. Non-refundable. Gates close strictly at 20:15.'),

-- Trip 2 Bookings
('book-201-train', 'trip-bom-goa-02', 1, 'TRAIN', 'Indian Railways (Konkan Railway)', 'TEJAS-22119', 'Tejas Express: Mumbai CSMT to Madgaon Jn (Goa)', 'Mumbai CSMT', 'Madgaon Junction (MAO)', '2026-11-20 05:50:00', '2026-11-20 14:40:00', 2150.00, 'INR', 'DISRUPTED', 'Delayed by 180 mins due to signal equipment failure near Ratnagiri.'),
('book-202-transfer', 'trip-bom-goa-02', 2, 'TRANSFER', 'Goa Tourism Prepaid Taxi', 'GOA-CAB-114', 'Station Transfer: Madgaon Jn to Candolim North Goa', 'Madgaon Junction', 'Candolim, North Goa', '2026-11-20 15:00:00', '2026-11-20 16:20:00', 1400.00, 'INR', 'IMPACTED', 'Connecting road transfer.'),
('book-203-hotel', 'trip-bom-goa-02', 3, 'HOTEL', 'Taj Fort Aguada Resort & Spa', 'TAJ-GOA-774', 'Resort Stay: Taj Fort Aguada Sea View Cottage', 'Sinquerim, Candolim', 'Sinquerim, Candolim', '2026-11-20 16:30:00', '2026-11-23 11:00:00', 24500.00, 'INR', 'IMPACTED', 'Check-in from 15:00 onwards.'),
('book-204-activity', 'trip-bom-goa-02', 4, 'ACTIVITY', 'Champions Yacht Club', 'CRUISE-SUNSET-09', 'Mandovi River Sunset Catamaran VIP Cruise', 'Panaji Jetty', 'Panaji Jetty', '2026-11-20 18:00:00', '2026-11-20 20:30:00', 2800.00, 'INR', 'IMPACTED', 'Boarding strictly closes at 17:40 PM. Non-refundable.'),

-- Trip 3 Bookings
('book-301-flight', 'trip-del-cok-03', 1, 'FLIGHT', 'Air India', 'AI-512', 'Flight AI-512: New Delhi (DEL) to Kochi (COK)', 'Indira Gandhi T3 (DEL)', 'Cochin Airport (COK)', '2026-11-25 06:00:00', '2026-11-25 09:15:00', 6200.00, 'INR', 'DISRUPTED', 'Delayed by 240 mins due to severe dense fog ground-stop at IGI Airport.'),
('book-302-transfer', 'trip-del-cok-03', 2, 'TRANSFER', 'Kerala Gods Own Cabs', 'KER-CAB-89', 'Airport Express Taxi: Kochi Airport to Alleppey Jetty', 'Cochin Airport (COK)', 'Alleppey Finishing Point Jetty', '2026-11-25 09:45:00', '2026-11-25 11:45:00', 2100.00, 'INR', 'IMPACTED', 'Required road connection to catch the scheduled houseboat cruise.'),
('book-303-hotel', 'trip-del-cok-03', 3, 'HOTEL', 'Spice Routes Luxury Houseboats', 'HB-KERALA-33', 'Private Premium Houseboat Cruise & Overnight Stay (Alleppey)', 'Alleppey Backwaters', 'Alleppey Backwaters', '2026-11-25 12:30:00', '2026-11-26 09:30:00', 16800.00, 'INR', 'IMPACTED', 'Boat casts off strictly at 13:00 PM. No boarding after departure.'),
('book-304-activity', 'trip-del-cok-03', 4, 'ACTIVITY', 'Kerala Kathakali Centre Fort Kochi', 'KATHA-EVE-12', 'Traditional Kathakali Classical Performance & Makeup Demo', 'Fort Kochi Kathakali Centre', 'Fort Kochi Kathakali Centre', '2026-11-25 18:30:00', '2026-11-25 20:30:00', 800.00, 'INR', 'IMPACTED', 'Evening performance.');

-- =====================================================
-- 4. INSERT REPORTED DISRUPTIONS
-- =====================================================
INSERT INTO disruptions (id, trip_id, booking_id, disruption_type, severity, planned_time, updated_time, delay_minutes, description) VALUES
('disrupt-blr-jai-01', 'trip-blr-jai-01', 'book-01-flight', 'FLIGHT_CANCELLATION', 'CRITICAL', '2026-11-15 07:00:00', '2026-11-15 07:00:00', 720, 'IndiGo flight 6E-204 from BLR to DEL scheduled at 07:00 AM cancelled at 05:15 AM due to unscheduled technical aircraft maintenance. No automatic rebooking provided at counter.'),
('disrupt-bom-goa-02', 'trip-bom-goa-02', 'book-201-train', 'TRAIN_DELAY', 'HIGH', '2026-11-20 05:50:00', '2026-11-20 08:50:00', 180, 'Tejas Express 22119 halted near Ratnagiri due to automated signal system breakdown. Delay estimated at 3 hours, pushing Madgaon arrival past 17:40 PM.'),
('disrupt-del-cok-03', 'trip-del-cok-03', 'book-301-flight', 'FLIGHT_DELAY', 'CRITICAL', '2026-11-25 06:00:00', '2026-11-25 10:00:00', 240, 'Dense morning fog at Delhi IGI Airport triggered low visibility procedures. Flight AI-512 held on ground for 4 hours, missing the Alleppey Houseboat 13:00 cast-off.');
