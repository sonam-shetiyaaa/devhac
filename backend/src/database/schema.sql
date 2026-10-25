-- TripRescue AI - Database Schema (MySQL)
-- System: AI-based Travel Recovery Agent

CREATE DATABASE IF NOT EXISTS trip_rescue_db;
USE trip_rescue_db;

-- 1. Trips table
CREATE TABLE IF NOT EXISTS trips (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  traveller_name VARCHAR(120) NOT NULL,
  origin VARCHAR(120) NOT NULL,
  destination VARCHAR(120) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('PLANNED', 'DISRUPTED', 'RECOVERY_IN_PROGRESS', 'RECOVERED') DEFAULT 'PLANNED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Traveller Constraints & Preferences
CREATE TABLE IF NOT EXISTS traveller_constraints (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) NOT NULL,
  max_additional_budget DECIMAL(10,2) DEFAULT 5000.00,
  preferred_arrival_deadline DATETIME,
  min_connection_buffer_mins INT DEFAULT 90,
  prefer_direct_transport BOOLEAN DEFAULT TRUE,
  avoid_overnight_travel BOOLEAN DEFAULT FALSE,
  critical_activities TEXT,
  notes TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Travel Bookings (Multi-leg flights, connecting trains, hotel stays, tours)
CREATE TABLE IF NOT EXISTS travel_bookings (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) NOT NULL,
  segment_order INT NOT NULL,
  type ENUM('FLIGHT', 'TRAIN', 'HOTEL', 'ACTIVITY', 'TRANSFER') NOT NULL,
  provider VARCHAR(120) NOT NULL,
  reference_code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  origin_station VARCHAR(120),
  destination_station VARCHAR(120),
  scheduled_departure DATETIME,
  scheduled_arrival DATETIME,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  status ENUM('CONFIRMED', 'DISRUPTED', 'IMPACTED', 'CANCELLED', 'REPLACED') DEFAULT 'CONFIRMED',
  notes TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Reported Disruptions
CREATE TABLE IF NOT EXISTS disruptions (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) NOT NULL,
  booking_id VARCHAR(64) NOT NULL,
  disruption_type ENUM('FLIGHT_DELAY', 'FLIGHT_CANCELLATION', 'TRAIN_DELAY', 'TRAIN_CANCELLATION', 'HOTEL_ISSUE', 'OTHER') NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'CRITICAL') DEFAULT 'CRITICAL',
  planned_time DATETIME,
  updated_time DATETIME,
  delay_minutes INT DEFAULT 0,
  description TEXT NOT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES travel_bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Recovery Options Evaluated by Decision Engine
CREATE TABLE IF NOT EXISTS recovery_options (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) NOT NULL,
  disruption_id VARCHAR(64) NOT NULL,
  option_code VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  transport_type VARCHAR(64) NOT NULL,
  provider VARCHAR(120) NOT NULL,
  route_summary VARCHAR(255) NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  additional_cost DECIMAL(10,2) NOT NULL,
  stops INT DEFAULT 0,
  overall_score INT NOT NULL,
  is_recommended BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  impact_on_connections TEXT NOT NULL,
  advantages TEXT NOT NULL,
  disadvantages TEXT NOT NULL,
  score_factors TEXT NOT NULL,
  justification TEXT NOT NULL,
  data_source VARCHAR(64) DEFAULT 'DEMONSTRATION_DATA',
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Revised Itineraries & Action Checklist
CREATE TABLE IF NOT EXISTS revised_itineraries (
  id VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) NOT NULL,
  selected_recovery_option_id VARCHAR(64) NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  summary TEXT NOT NULL,
  revised_schedule TEXT NOT NULL,
  remaining_conflicts TEXT,
  actions_checklist TEXT NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
