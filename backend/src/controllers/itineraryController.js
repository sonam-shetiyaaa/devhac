const db = require('../database/dbAdapter');

module.exports = {
  async getItinerary(req, res) {
    try {
      const tripId = req.params.tripId;
      const trip = await db.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }

      if (!trip.revisedItinerary) {
        return res.status(404).json({
          success: false,
          error: 'No revised itinerary generated yet for this trip. Please approve a recovery plan first.'
        });
      }

      const selectedOption = trip.recoveryOptions?.find(
        o => o.id === trip.revisedItinerary.selected_recovery_option_id || o.is_approved
      ) || null;

      res.json({
        success: true,
        data: {
          trip: {
            id: trip.id,
            title: trip.title,
            traveller_name: trip.traveller_name,
            origin: trip.origin,
            destination: trip.destination,
            status: trip.status,
          },
          itinerary: trip.revisedItinerary,
          selectedOption,
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async toggleChecklistItem(req, res) {
    try {
      const { tripId, actionId } = req.params;
      const { completed } = req.body;

      const updated = await db.updateActionChecklist(tripId, actionId, completed);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Itinerary or action item not found' });
      }

      res.json({
        success: true,
        message: 'Action checklist item updated',
        data: updated.actions_checklist,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
