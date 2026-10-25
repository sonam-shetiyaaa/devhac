const db = require('../database/dbAdapter');

module.exports = {
  async getAllTrips(req, res) {
    try {
      const trips = await db.getAllTrips();
      res.json({ success: true, count: trips.length, data: trips });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getTripById(req, res) {
    try {
      const trip = await db.getTripById(req.params.id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }
      res.json({ success: true, data: trip });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async createTrip(req, res) {
    try {
      const { title, traveller_name, origin, destination, start_date, end_date, constraints, bookings } = req.body;

      if (!title || !traveller_name || !origin || !destination) {
        return res.status(400).json({
          success: false,
          error: 'Missing required trip fields: title, traveller_name, origin, and destination are mandatory.'
        });
      }

      const trip = await db.createTrip({
        title,
        traveller_name,
        origin,
        destination,
        start_date: start_date || new Date().toISOString(),
        end_date: end_date || new Date(Date.now() + 86400000 * 3).toISOString(),
        constraints,
        bookings,
      });

      res.status(201).json({ success: true, message: 'Trip created successfully', data: trip });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async addBooking(req, res) {
    try {
      const tripId = req.params.id;
      const trip = await db.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }

      const booking = await db.addBooking(tripId, req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async resetDemo(req, res) {
    try {
      await db.resetToDemo();
      res.json({ success: true, message: 'Demo scenario reset to initial state successfully' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getStatus(req, res) {
    try {
      const dbStatus = db.getDbStatus();
      res.json({
        success: true,
        service: 'TripRescue AI Backend API',
        version: '1.0.0',
        db: dbStatus,
        ai: {
          geminiConfigured: !!process.env.GEMINI_API_KEY,
          openaiConfigured: !!process.env.OPENAI_API_KEY,
          mode: process.env.GEMINI_API_KEY ? 'LIVE_GEMINI_AI' : 'LOCAL_REASONING_CORE',
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
