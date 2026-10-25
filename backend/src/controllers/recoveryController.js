const db = require('../database/dbAdapter');
const { analyzeCascadingConflicts } = require('../engine/conflictDetector');
const { generateAlternativesForDisruption } = require('../engine/alternativesGenerator');
const { evaluateAndRankOptions, scoreRecoveryOption } = require('../engine/scoringEngine');
const { explainRecoveryOptions, buildRevisedItinerary } = require('../engine/recoveryAgent');

module.exports = {
  async analyzeRecovery(req, res) {
    try {
      const { tripId } = req.body;
      if (!tripId) {
        return res.status(400).json({ success: false, error: 'tripId is required' });
      }

      const trip = await db.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }

      // Check if disruptions exist
      const disruptions = trip.disruptions || [];
      if (disruptions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No active disruptions reported on this trip to analyze.'
        });
      }

      const primaryDisruption = disruptions[0];
      const primaryBooking = trip.bookings.find(b => b.id === primaryDisruption.booking_id) || trip.bookings[0];

      // 1. Whole-Trip Cascade Impact Analysis
      const cascadeAnalysis = analyzeCascadingConflicts(
        primaryBooking,
        trip.bookings,
        primaryDisruption,
        trip.constraints || {}
      );

      // 2. Generate Alternatives
      const rawAlternatives = generateAlternativesForDisruption(
        trip,
        primaryDisruption,
        trip.constraints || {}
      );

      // 3. Evaluate and Rank Options with Decision Engine
      const scoredOptions = evaluateAndRankOptions(
        rawAlternatives,
        trip.constraints || {},
        trip.bookings,
        primaryDisruption
      );

      // 4. Save to Database
      await db.saveRecoveryOptions(tripId, primaryDisruption.id, scoredOptions);

      // 5. Run AI Reasoning Engine for Justification & Trade-Offs
      const aiExplanation = await explainRecoveryOptions(
        trip,
        primaryDisruption,
        cascadeAnalysis,
        scoredOptions,
        trip.constraints || {}
      );

      res.json({
        success: true,
        data: {
          tripId,
          primaryDisruption,
          cascadeAnalysis,
          scoredOptions,
          aiExplanation,
        }
      });
    } catch (err) {
      console.error('Error in analyzeRecovery:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getRecoveryOptions(req, res) {
    try {
      const tripId = req.params.tripId;
      const trip = await db.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }

      res.json({
        success: true,
        data: {
          options: trip.recoveryOptions || [],
          constraints: trip.constraints,
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async compareWithRelaxedConstraints(req, res) {
    try {
      const { tripId, relaxedConstraints } = req.body;
      const trip = await db.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }

      const activeConstraints = {
        ...trip.constraints,
        ...relaxedConstraints,
      };

      const primaryDisruption = trip.disruptions?.[0] || {
        disruption_type: 'FLIGHT_CANCELLATION',
        delay_minutes: 720,
      };

      // Re-evaluate existing or new options
      const rawOptions = trip.recoveryOptions && trip.recoveryOptions.length > 0
        ? trip.recoveryOptions
        : generateAlternativesForDisruption(trip, primaryDisruption, activeConstraints);

      const reScored = evaluateAndRankOptions(
        rawOptions,
        activeConstraints,
        trip.bookings,
        primaryDisruption
      );

      res.json({
        success: true,
        data: {
          reScoredOptions: reScored,
          activeConstraints,
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async confirmRecovery(req, res) {
    try {
      const { tripId, optionId } = req.body;
      if (!tripId || !optionId) {
        return res.status(400).json({ success: false, error: 'tripId and optionId are required' });
      }

      const trip = await db.getTripById(tripId);
      if (!trip) {
        return res.status(404).json({ success: false, error: 'Trip not found' });
      }

      const optionsList = Array.isArray(trip.recoveryOptions) ? trip.recoveryOptions : [];
      const generatedList = generateAlternativesForDisruption(trip, trip.disruptions?.[0], trip.constraints || {});

      const selectedOption = optionsList.find(o => o.id === optionId || o.option_code === optionId)
        || generatedList.find(o => o.id === optionId || o.option_code === optionId)
        || optionsList[0]
        || generatedList[0];

      if (!selectedOption) {
        return res.status(404).json({ success: false, error: 'Selected recovery option not found' });
      }

      // Build the revised itinerary and required next action checklist
      const itineraryPackage = buildRevisedItinerary(
        trip,
        selectedOption,
        trip.bookings,
        trip.constraints || {}
      );

      // Save confirmed recovery in database
      const savedItinerary = await db.confirmRecoveryPlan(tripId, selectedOption.id, itineraryPackage);

      res.json({
        success: true,
        message: 'Recovery plan confirmed and revised itinerary generated successfully.',
        data: {
          itinerary: savedItinerary,
          selectedOption,
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
