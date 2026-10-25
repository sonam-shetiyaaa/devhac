const express = require('express');
const router = express.Router();

const tripController = require('../controllers/tripController');
const disruptionController = require('../controllers/disruptionController');
const recoveryController = require('../controllers/recoveryController');
const itineraryController = require('../controllers/itineraryController');

// API Index
router.get('/', (req, res) => {
  res.json({
    status: 'TripRescue AI API Gateway Online',
    endpoints: {
      status: '/api/status',
      trips: '/api/trips',
      disruptions: '/api/disruptions',
      recoveryAnalyze: '/api/recovery/analyze',
      demoReset: '/api/demo/reset'
    }
  });
});

// Status & Health
router.get('/status', tripController.getStatus);
router.post('/demo/reset', tripController.resetDemo);

// Trips API
router.get('/trips', tripController.getAllTrips);
router.post('/trips', tripController.createTrip);
router.get('/trips/:id', tripController.getTripById);
router.post('/trips/:id/bookings', tripController.addBooking);

// Disruptions API
router.post('/disruptions', disruptionController.reportDisruption);
router.post('/disruptions/preview', disruptionController.previewCascadeImpact);

// Recovery Engine & AI Workflow API
router.post('/recovery/analyze', recoveryController.analyzeRecovery);
router.get('/recovery/options/:tripId', recoveryController.getRecoveryOptions);
router.post('/recovery/compare', recoveryController.compareWithRelaxedConstraints);
router.post('/recovery/confirm', recoveryController.confirmRecovery);

// Revised Itinerary API
router.get('/itinerary/:tripId', itineraryController.getItinerary);
router.patch('/itinerary/:tripId/actions/:actionId', itineraryController.toggleChecklistItem);

module.exports = router;
