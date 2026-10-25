const mysql = require('mysql2/promise');
const config = require('../config/env');
const store = require('./mockStore');
const fs = require('fs');
const path = require('path');

let pool = null;
let isConnectedToMySQL = false;

async function initDatabase() {
  try {
    // Attempt connecting to MySQL server
    const connection = await mysql.createConnection({
      host: config.DB.host,
      port: config.DB.port,
      user: config.DB.user,
      password: config.DB.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.DB.database}\`;`);
    await connection.end();

    // Create pool for configured database
    pool = mysql.createPool({
      host: config.DB.host,
      port: config.DB.port,
      user: config.DB.user,
      password: config.DB.password,
      database: config.DB.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Run schema tables
    const schemaSql = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf-8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use') && !s.toLowerCase().startsWith('create database'));

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err) {
        // Table might already exist or minor constraint notice
      }
    }

    isConnectedToMySQL = true;
    console.log('[TripRescue DB] Connected successfully to MySQL database:', config.DB.database);
  } catch (err) {
    isConnectedToMySQL = false;
    console.log(`[TripRescue DB] Note: MySQL not available (${err.message}). Using resilient embedded storage mode.`);
  }
}

// Initialize on boot
initDatabase();

module.exports = {
  getDbStatus() {
    return {
      connected: isConnectedToMySQL,
      engine: isConnectedToMySQL ? 'MySQL 9.5 (Relational Engine)' : 'Resilient File Store (Zero-Dependency Engine)',
      database: isConnectedToMySQL ? config.DB.database : 'trip_rescue_db (local)',
    };
  },

  async getAllTrips() {
    if (isConnectedToMySQL && pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM trips ORDER BY created_at DESC');
        return rows;
      } catch (e) {
        console.error('MySQL query error in getAllTrips, falling back to local store:', e.message);
      }
    }
    return store.data.trips;
  },

  async getTripById(id) {
    if (isConnectedToMySQL && pool) {
      try {
        const [trips] = await pool.query('SELECT * FROM trips WHERE id = ?', [id]);
        if (trips.length === 0) return null;
        const trip = trips[0];

        const [constraints] = await pool.query('SELECT * FROM traveller_constraints WHERE trip_id = ?', [id]);
        const [bookings] = await pool.query('SELECT * FROM travel_bookings WHERE trip_id = ? ORDER BY segment_order ASC', [id]);
        const [disruptions] = await pool.query('SELECT * FROM disruptions WHERE trip_id = ? ORDER BY reported_at DESC', [id]);
        const [recoveryOptions] = await pool.query('SELECT * FROM recovery_options WHERE trip_id = ? ORDER BY overall_score DESC', [id]);
        const [itineraries] = await pool.query('SELECT * FROM revised_itineraries WHERE trip_id = ? ORDER BY generated_at DESC LIMIT 1', [id]);

        return {
          ...trip,
          constraints: constraints[0] || null,
          bookings,
          disruptions,
          recoveryOptions: recoveryOptions.map(opt => ({
            ...opt,
            advantages: typeof opt.advantages === 'string' ? JSON.parse(opt.advantages) : opt.advantages,
            disadvantages: typeof opt.disadvantages === 'string' ? JSON.parse(opt.disadvantages) : opt.disadvantages,
            score_factors: typeof opt.score_factors === 'string' ? JSON.parse(opt.score_factors) : opt.score_factors,
          })),
          revisedItinerary: itineraries.length > 0 ? {
            ...itineraries[0],
            revised_schedule: typeof itineraries[0].revised_schedule === 'string' ? JSON.parse(itineraries[0].revised_schedule) : itineraries[0].revised_schedule,
            remaining_conflicts: typeof itineraries[0].remaining_conflicts === 'string' ? JSON.parse(itineraries[0].remaining_conflicts) : itineraries[0].remaining_conflicts,
            actions_checklist: typeof itineraries[0].actions_checklist === 'string' ? JSON.parse(itineraries[0].actions_checklist) : itineraries[0].actions_checklist,
          } : null,
        };
      } catch (e) {
        console.error('MySQL getTripById error, falling back:', e.message);
      }
    }

    const trip = store.data.trips.find(t => t.id === id);
    if (!trip) return null;
    const constraints = store.data.constraints.find(c => c.trip_id === id) || null;
    const bookings = store.data.bookings.filter(b => b.trip_id === id).sort((a, b) => a.segment_order - b.segment_order);
    const disruptions = store.data.disruptions.filter(d => d.trip_id === id);
    const recoveryOptions = store.data.recovery_options.filter(r => r.trip_id === id).sort((a, b) => b.overall_score - a.overall_score);
    const revisedItinerary = store.data.revised_itineraries.find(i => i.trip_id === id) || null;

    return {
      ...trip,
      constraints,
      bookings,
      disruptions,
      recoveryOptions,
      revisedItinerary,
    };
  },

  async createTrip(tripData) {
    const id = tripData.id || `trip-${Date.now()}`;
    const newTrip = {
      id,
      title: tripData.title,
      traveller_name: tripData.traveller_name,
      origin: tripData.origin,
      destination: tripData.destination,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      status: tripData.status || 'PLANNED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isConnectedToMySQL && pool) {
      try {
        await pool.query(
          'INSERT INTO trips (id, title, traveller_name, origin, destination, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [newTrip.id, newTrip.title, newTrip.traveller_name, newTrip.origin, newTrip.destination, newTrip.start_date, newTrip.end_date, newTrip.status]
        );
      } catch (e) {
        console.error('MySQL createTrip error:', e.message);
      }
    }

    store.data.trips.unshift(newTrip);

    // Save constraints if provided
    if (tripData.constraints) {
      const constraintId = `cons-${Date.now()}`;
      const newConstraint = {
        id: constraintId,
        trip_id: id,
        max_additional_budget: parseFloat(tripData.constraints.max_additional_budget) || 5000.0,
        preferred_arrival_deadline: tripData.constraints.preferred_arrival_deadline || null,
        min_connection_buffer_mins: parseInt(tripData.constraints.min_connection_buffer_mins, 10) || 90,
        prefer_direct_transport: tripData.constraints.prefer_direct_transport ?? true,
        avoid_overnight_travel: tripData.constraints.avoid_overnight_travel ?? false,
        critical_activities: tripData.constraints.critical_activities || '',
        notes: tripData.constraints.notes || '',
      };
      if (isConnectedToMySQL && pool) {
        try {
          await pool.query(
            'INSERT INTO traveller_constraints (id, trip_id, max_additional_budget, preferred_arrival_deadline, min_connection_buffer_mins, prefer_direct_transport, avoid_overnight_travel, critical_activities, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newConstraint.id, id, newConstraint.max_additional_budget, newConstraint.preferred_arrival_deadline, newConstraint.min_connection_buffer_mins, newConstraint.prefer_direct_transport, newConstraint.avoid_overnight_travel, newConstraint.critical_activities, newConstraint.notes]
          );
        } catch (e) {
          console.error('MySQL insert constraints error:', e.message);
        }
      }
      store.data.constraints.push(newConstraint);
    }

    // Save bookings if provided
    if (Array.isArray(tripData.bookings)) {
      for (let i = 0; i < tripData.bookings.length; i++) {
        const b = tripData.bookings[i];
        const bookingId = b.id || `book-${Date.now()}-${i}`;
        const newBooking = {
          id: bookingId,
          trip_id: id,
          segment_order: i + 1,
          type: b.type || 'FLIGHT',
          provider: b.provider || 'Provider',
          reference_code: b.reference_code || 'REF-001',
          title: b.title || `Segment ${i + 1}`,
          origin_station: b.origin_station || '',
          destination_station: b.destination_station || '',
          scheduled_departure: b.scheduled_departure,
          scheduled_arrival: b.scheduled_arrival,
          cost: parseFloat(b.cost) || 0.0,
          currency: b.currency || 'INR',
          status: b.status || 'CONFIRMED',
          notes: b.notes || '',
        };
        if (isConnectedToMySQL && pool) {
          try {
            await pool.query(
              'INSERT INTO travel_bookings (id, trip_id, segment_order, type, provider, reference_code, title, origin_station, destination_station, scheduled_departure, scheduled_arrival, cost, currency, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [newBooking.id, id, newBooking.segment_order, newBooking.type, newBooking.provider, newBooking.reference_code, newBooking.title, newBooking.origin_station, newBooking.destination_station, newBooking.scheduled_departure, newBooking.scheduled_arrival, newBooking.cost, newBooking.currency, newBooking.status, newBooking.notes]
            );
          } catch (e) {
            console.error('MySQL insert booking error:', e.message);
          }
        }
        store.data.bookings.push(newBooking);
      }
    }

    store.saveToFile();
    return newTrip;
  },

  async addBooking(tripId, bookingData) {
    const existing = store.data.bookings.filter(b => b.trip_id === tripId);
    const newBooking = {
      id: bookingData.id || `book-${Date.now()}`,
      trip_id: tripId,
      segment_order: existing.length + 1,
      type: bookingData.type || 'FLIGHT',
      provider: bookingData.provider || '',
      reference_code: bookingData.reference_code || '',
      title: bookingData.title || '',
      origin_station: bookingData.origin_station || '',
      destination_station: bookingData.destination_station || '',
      scheduled_departure: bookingData.scheduled_departure,
      scheduled_arrival: bookingData.scheduled_arrival,
      cost: parseFloat(bookingData.cost) || 0.0,
      currency: bookingData.currency || 'INR',
      status: bookingData.status || 'CONFIRMED',
      notes: bookingData.notes || '',
    };

    if (isConnectedToMySQL && pool) {
      try {
        await pool.query(
          'INSERT INTO travel_bookings (id, trip_id, segment_order, type, provider, reference_code, title, origin_station, destination_station, scheduled_departure, scheduled_arrival, cost, currency, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newBooking.id, tripId, newBooking.segment_order, newBooking.type, newBooking.provider, newBooking.reference_code, newBooking.title, newBooking.origin_station, newBooking.destination_station, newBooking.scheduled_departure, newBooking.scheduled_arrival, newBooking.cost, newBooking.currency, newBooking.status, newBooking.notes]
        );
      } catch (e) {
        console.error('MySQL addBooking error:', e.message);
      }
    }
    store.data.bookings.push(newBooking);
    store.saveToFile();
    return newBooking;
  },

  async reportDisruption(disruptionData) {
    const id = disruptionData.id || `disrupt-${Date.now()}`;
    const newDisruption = {
      id,
      trip_id: disruptionData.trip_id,
      booking_id: disruptionData.booking_id,
      disruption_type: disruptionData.disruption_type,
      severity: disruptionData.severity || 'CRITICAL',
      planned_time: disruptionData.planned_time,
      updated_time: disruptionData.updated_time,
      delay_minutes: parseInt(disruptionData.delay_minutes, 10) || 0,
      description: disruptionData.description,
      reported_at: new Date().toISOString(),
    };

    if (isConnectedToMySQL && pool) {
      try {
        await pool.query(
          'INSERT INTO disruptions (id, trip_id, booking_id, disruption_type, severity, planned_time, updated_time, delay_minutes, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [newDisruption.id, newDisruption.trip_id, newDisruption.booking_id, newDisruption.disruption_type, newDisruption.severity, newDisruption.planned_time, newDisruption.updated_time, newDisruption.delay_minutes, newDisruption.description]
        );
        await pool.query('UPDATE trips SET status = "DISRUPTED" WHERE id = ?', [newDisruption.trip_id]);
        await pool.query('UPDATE travel_bookings SET status = "DISRUPTED" WHERE id = ?', [newDisruption.booking_id]);
      } catch (e) {
        console.error('MySQL reportDisruption error:', e.message);
      }
    }

    store.data.disruptions.unshift(newDisruption);

    // Update trip status
    const trip = store.data.trips.find(t => t.id === newDisruption.trip_id);
    if (trip) trip.status = 'DISRUPTED';

    // Update primary booking status
    const booking = store.data.bookings.find(b => b.id === newDisruption.booking_id);
    if (booking) booking.status = 'DISRUPTED';

    store.saveToFile();
    return newDisruption;
  },

  async updateBookingStatus(bookingId, status) {
    if (isConnectedToMySQL && pool) {
      try {
        await pool.query('UPDATE travel_bookings SET status = ? WHERE id = ?', [status, bookingId]);
      } catch (e) {
        console.error('MySQL updateBookingStatus error:', e.message);
      }
    }
    const b = store.data.bookings.find(bk => bk.id === bookingId);
    if (b) {
      b.status = status;
      store.saveToFile();
    }
  },

  async saveRecoveryOptions(tripId, disruptionId, options) {
    if (isConnectedToMySQL && pool) {
      try {
        await pool.query('DELETE FROM recovery_options WHERE trip_id = ?', [tripId]);
        for (const opt of options) {
          await pool.query(
            `INSERT INTO recovery_options (
              id, trip_id, disruption_id, option_code, title, transport_type, provider,
              route_summary, departure_time, arrival_time, total_cost, additional_cost,
              stops, overall_score, is_recommended, is_approved, impact_on_connections,
              advantages, disadvantages, score_factors, justification, data_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              opt.id, tripId, disruptionId, opt.option_code, opt.title, opt.transport_type,
              opt.provider, opt.route_summary, opt.departure_time, opt.arrival_time,
              opt.total_cost, opt.additional_cost, opt.stops, opt.overall_score,
              opt.is_recommended ? 1 : 0, opt.is_approved ? 1 : 0, opt.impact_on_connections,
              JSON.stringify(opt.advantages), JSON.stringify(opt.disadvantages),
              JSON.stringify(opt.score_factors), opt.justification, opt.data_source || 'DEMONSTRATION_DATA'
            ]
          );
        }
      } catch (e) {
        console.error('MySQL saveRecoveryOptions error:', e.message);
      }
    }

    // Update store
    const normalizedOptions = options.map(opt => ({
      ...opt,
      trip_id: tripId,
      disruption_id: disruptionId,
    }));
    store.data.recovery_options = store.data.recovery_options.filter(o => o.trip_id !== tripId);
    store.data.recovery_options.push(...normalizedOptions);
    store.saveToFile();
    return normalizedOptions;
  },

  async confirmRecoveryPlan(tripId, optionId, itineraryData) {
    const itineraryId = itineraryData.id || `itin-${Date.now()}`;
    const newItin = {
      id: itineraryId,
      trip_id: tripId,
      selected_recovery_option_id: optionId,
      generated_at: new Date().toISOString(),
      summary: itineraryData.summary,
      revised_schedule: itineraryData.revised_schedule,
      remaining_conflicts: itineraryData.remaining_conflicts || [],
      actions_checklist: itineraryData.actions_checklist || [],
    };

    if (isConnectedToMySQL && pool) {
      try {
        await pool.query('DELETE FROM revised_itineraries WHERE trip_id = ?', [tripId]);
        await pool.query(
          `INSERT INTO revised_itineraries (id, trip_id, selected_recovery_option_id, summary, revised_schedule, remaining_conflicts, actions_checklist)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newItin.id,
            tripId,
            optionId,
            newItin.summary,
            JSON.stringify(newItin.revised_schedule),
            JSON.stringify(newItin.remaining_conflicts),
            JSON.stringify(newItin.actions_checklist)
          ]
        );
        await pool.query('UPDATE trips SET status = "RECOVERED" WHERE id = ?', [tripId]);
        await pool.query('UPDATE recovery_options SET is_approved = 1 WHERE id = ?', [optionId]);
      } catch (e) {
        console.error('MySQL confirmRecoveryPlan error:', e.message);
      }
    }

    // In store
    store.data.revised_itineraries = store.data.revised_itineraries.filter(i => i.trip_id !== tripId);
    store.data.revised_itineraries.push(newItin);

    const trip = store.data.trips.find(t => t.id === tripId);
    if (trip) trip.status = 'RECOVERED';

    const opt = store.data.recovery_options.find(o => o.id === optionId);
    if (opt) opt.is_approved = true;

    store.saveToFile();
    return newItin;
  },

  async updateActionChecklist(tripId, actionId, completed) {
    const itin = store.data.revised_itineraries.find(i => i.trip_id === tripId);
    if (itin && Array.isArray(itin.actions_checklist)) {
      const item = itin.actions_checklist.find(a => a.id === actionId);
      if (item) {
        item.completed = completed;
        store.saveToFile();
      }
      return itin;
    }
    return null;
  },

  async resetToDemo() {
    return store.reset();
  }
};
