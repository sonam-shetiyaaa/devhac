// TripRescue AI - Agentic Recovery Workflow & LLM Reasoning Engine
// Manages end-to-end recovery analysis, decision justification, and revised itinerary synthesis.

const config = require('../config/env');

/**
 * Builds the AI prompt with structured contextual data from the backend engine.
 */
function buildReasoningPrompt(trip, disruption, cascadeAnalysis, scoredOptions, constraints) {
  return `
You are TripRescue AI, an advanced AI travel recovery specialist.
Explain the travel recovery options for a disrupted journey based strictly on the verified backend evaluation data below.
Do not hallucinate or invent new prices, schedules, or airline booking codes.

TRIP CONTEXT:
- Trip: ${trip.title} (${trip.origin} to ${trip.destination})
- Traveller: ${trip.traveller_name}

REPORTED DISRUPTION:
- Disrupted Booking: ${disruption.bookingTitle || disruption.booking_id}
- Type: ${disruption.disruption_type}
- Details: ${disruption.description}

CASCADING CONFLICTS DETECTED:
${cascadeAnalysis.impactedBookings.map(b => `- Level ${b.cascadeLevel}: [${b.type}] ${b.bookingTitle} (${b.issueType}) - ${b.description}`).join('\n')}

TRAVELLER CONSTRAINTS:
- Max Additional Budget: ₹${constraints?.max_additional_budget || 5000}
- Preferred Arrival Deadline: ${constraints?.preferred_arrival_deadline || '21:00'}
- Prefer Direct Transport: ${constraints?.prefer_direct_transport ? 'Yes' : 'No'}
- Critical Activities: ${constraints?.critical_activities || 'None specified'}

EVALUATED RECOVERY ALTERNATIVES (Calculated by Decision Engine):
${scoredOptions.map(opt => `
Option ${opt.option_code}: ${opt.title}
- Provider / Route: ${opt.provider} | ${opt.route_summary}
- Departure: ${opt.departure_time} -> Arrival: ${opt.arrival_time}
- Total Score: ${opt.overall_score}/100 [Is Recommended: ${opt.is_recommended ? 'YES' : 'NO'}]
- Additional Cost: ₹${opt.additional_cost}
- Factors Breakdown: Timing: ${opt.score_factors.time.score}/35, Budget: ${opt.score_factors.budget.score}/25, Cascade Healed: ${opt.score_factors.cascade.score}/25, Comfort: ${opt.score_factors.comfort.score}/15
- Cascade Impact: ${opt.impact_on_connections}
- Advantages: ${opt.advantages.join('; ')}
- Disadvantages: ${opt.disadvantages.join('; ')}
`).join('\n')}

Provide a structured, empathetic, and clear explanation:
1. Executive Summary: What broke in the overall trip.
2. Recommendation Justification: Why the top-scoring option is the best whole-trip recovery.
3. Trade-offs Analysis: Why each alternative was scored lower or when a traveller might prefer them.
4. Constraint Relaxation: If any constraints cannot be met, explain what trade-off must be made.
`;
}

/**
 * Fallback reasoning engine: generates human-grade natural language explanations
 * tailored dynamically for any route and disruption context.
 */
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
    execSummary = `A primary journey disruption (${disruption.disruption_type.replace(/_/g, ' ')}) has triggered a domino effect across your itinerary. Left unresolved, this cascade causes missed connections on subsequent transport legs, compromises hotel check-in times, and risks missing "${criticalAct}".`;
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

/**
 * Main AI reasoning agent call.
 */
async function explainRecoveryOptions(trip, disruption, cascadeAnalysis, scoredOptions, constraints) {
  // If Gemini key is set, query Gemini
  if (config.AI.geminiKey) {
    try {
      const prompt = buildReasoningPrompt(trip, disruption, cascadeAnalysis, scoredOptions, constraints);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.AI.geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            source: 'GOOGLE_GEMINI_API',
            rawText: text,
            ...generateFallbackExplanation(trip, disruption, cascadeAnalysis, scoredOptions, constraints),
            llmGeneratedNotes: text,
          };
        }
      }
    } catch (err) {
      console.warn('[TripRescue AI Agent] Gemini API call failed, using reasoning core fallback:', err.message);
    }
  }

  // Fallback reasoning
  return generateFallbackExplanation(trip, disruption, cascadeAnalysis, scoredOptions, constraints);
}

/**
 * Generates the revised itinerary and required next action checklist when a plan is approved.
 */
function buildRevisedItinerary(trip, selectedOption, existingBookings, constraints) {
  const isDirect = selectedOption.stops === 0;

  // Build revised schedule segments
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

  // Build Required Actions Checklist
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

module.exports = {
  buildReasoningPrompt,
  generateFallbackExplanation,
  explainRecoveryOptions,
  buildRevisedItinerary,
};
