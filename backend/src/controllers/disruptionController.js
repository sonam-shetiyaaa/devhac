const db = require('../database/dbAdapter');
const { analyzeCascadingConflicts } = require('../engine/conflictDetector');

module.exports = {
  async reportDisruption(req, res) {
    try {
      const {
        trip_id,
        booking_id,
        disruption_type,
        severity,
        planned_time,
        updated_time,
        delay_minutes,
        description,
      } = req.body;

      if (!trip_id || !booking_id || !disruption_type) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: trip_id, booking_id, and disruption_type must be provided.'
        });
      }

      const trip = await db.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Associated trip not found' });
      }

      const booking = trip.bookings.find(b => b.id === booking_id);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Disrupted booking not found in trip' });
      }

      // Save disruption
      const disruption = await db.reportDisruption({
        trip_id,
        booking_id,
        disruption_type,
        severity: severity || 'CRITICAL',
        planned_time: planned_time || booking.scheduled_departure,
        updated_time: updated_time || planned_time || booking.scheduled_departure,
        delay_minutes: parseInt(delay_minutes, 10) || 0,
        description: description || `Reported ${disruption_type} for ${booking.title}`,
      });

      // Compute cascading impacts
      const cascade = analyzeCascadingConflicts(
        booking,
        trip.bookings,
        disruption,
        trip.constraints || {}
      );

      // Update status of impacted bookings
      for (const impacted of cascade.impactedBookings) {
        await db.updateBookingStatus(impacted.bookingId, 'IMPACTED');
      }

      res.status(201).json({
        success: true,
        message: 'Disruption recorded and cascade impact analyzed successfully.',
        data: {
          disruption,
          cascade,
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async previewCascadeImpact(req, res) {
    try {
      const { trip_id, booking_id, disruption_type, delay_minutes } = req.body;
      const trip = await db.getTripById(trip_id);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }

      const booking = trip.bookings.find(b => b.id === booking_id);
      if (!booking) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }

      const cascade = analyzeCascadingConflicts(
        booking,
        trip.bookings,
        { disruption_type, delay_minutes: parseInt(delay_minutes, 10) || 0 },
        trip.constraints || {}
      );

      res.json({ success: true, data: cascade });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
