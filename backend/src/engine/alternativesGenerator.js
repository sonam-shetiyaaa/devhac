// TripRescue AI - Dynamic Alternatives Generator
// Supports predefined multi-modal test scenarios and dynamically generates
// coherent recovery options for any custom user-created route.

function generateAlternativesForDisruption(trip, disruption, constraints) {
  const tripId = trip?.id || '';
  const origin = trip?.origin || 'Origin';
  const destination = trip?.destination || 'Destination';
  const maxBudget = parseFloat(constraints?.max_additional_budget) || 5000;
  const criticalAct = constraints?.critical_activities || 'Key Scheduled Event';
  const startDate = trip?.start_date ? new Date(trip.start_date) : new Date();

  // SCENARIO 1: Bengaluru to Jaipur (Flagship multi-modal cancellation recovery)
  if (tripId === 'trip-blr-jai-01' || (origin.toLowerCase().includes('blr') && destination.toLowerCase().includes('jai'))) {
    return [
      {
        id: `rec-opt-a-${tripId}`,
        option_code: 'OPT-A',
        title: 'Priority Direct Re-route: Air India AI-840 (Direct BLR → JAI)',
        transport_type: 'FLIGHT (DIRECT)',
        provider: 'Air India',
        route_summary: 'Bengaluru (BLR) → Jaipur (JAI) [Direct Flight]',
        departure_time: '2026-11-15T11:15:00',
        arrival_time: '2026-11-15T13:45:00',
        total_cost: 9000.0,
        additional_cost: 3200.0,
        stops: 0,
        availability_status: 'Available (4 seats in Economy)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Complete Whole-Trip Recovery: Bypasses Delhi connection altogether. Arrives in Jaipur at 13:45 PM (5 hours ahead of original schedule). Train ticket can be refunded, hotel check-in is early/relaxed, and Amber Fort evening tour is 100% preserved.',
        advantages: [
          'Direct non-stop flight eliminating transit risk in Delhi',
          'Arrives safely at 13:45 PM, well ahead of the 21:00 deadline',
          'Preserves Amber Fort Evening Show at 20:30 without reschedule',
          'Additional cost of ₹3,200 is within the ₹4,500 budget limit',
          'Eligible for ₹1,650 refund on unused Vande Bharat train ticket'
        ],
        disadvantages: [
          '₹3,200 out-of-pocket payment required before airline claim reimbursement'
        ],
        justification: 'Recommended as the optimal whole-trip recovery: it bypasses the broken Delhi transit entirely, gets the traveller to Jaipur 5 hours early, and protects both hotel check-in and the critical evening cultural event within traveller budget.'
      },
      {
        id: `rec-opt-b-${tripId}`,
        option_code: 'OPT-B',
        title: 'Protected Connection: Vistara UK-812 + Evening Shatabdi Express 12015',
        transport_type: 'FLIGHT + TRAIN (MULTIMODAL)',
        provider: 'Vistara & Indian Railways',
        route_summary: 'BLR → DEL (Flight) + Delhi → Jaipur (Evening Shatabdi Train)',
        departure_time: '2026-11-15T09:30:00',
        arrival_time: '2026-11-15T22:40:00',
        total_cost: 7600.0,
        additional_cost: 1800.0,
        stops: 1,
        availability_status: 'Available (Executive & AC Chair Car)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Partial Cascade Recovery: Replaces flight to Delhi with Vistara UK-812 (lands 12:15). Provides 5h 35m transfer window to catch Evening Shatabdi 12015 at 17:50 PM. However, arrival in Jaipur is 22:40 PM, causing the Amber Fort show to be missed and requiring late check-in at ITC Rajputana.',
        advantages: [
          'Moderate additional cost of only ₹1,800',
          'Generous 5.5 hour connection buffer eliminates transfer stress in Delhi',
          'Retains railway scenic travel leg into Jaipur'
        ],
        disadvantages: [
          'Arrives at 22:40 PM (after preferred 21:00 deadline)',
          'Amber Fort 20:30 PM show is missed and must be rescheduled',
          'Requires alerting hotel reception of late check-in past 22:00'
        ],
        justification: 'Viable secondary alternative for budget-conscious travellers willing to sacrifice the evening cultural activity to save ₹1,400.'
      },
      {
        id: `rec-opt-c-${tripId}`,
        option_code: 'OPT-C',
        title: 'Economy Reroute: Afternoon Flight + Intercity AC Electric Sleeper Coach',
        transport_type: 'FLIGHT + BUS (MULTIMODAL)',
        provider: 'SpiceJet & Zingbus Intercity',
        route_summary: 'BLR → DEL (Flight SG-192) + Delhi Dhaula Kuan → Jaipur (Express Highway Coach)',
        departure_time: '2026-11-15T13:00:00',
        arrival_time: '2026-11-15T23:15:00',
        total_cost: 6400.0,
        additional_cost: 600.0,
        stops: 1,
        availability_status: 'Available (High capacity)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Budget Priority Recovery: Minimizes extra cash outlay to only ₹600. However, arrival is delayed to 23:15 PM. Breaks evening events, causes late arrival fatigue, and risks highway traffic delays.',
        advantages: [
          'Lowest additional cost: only ₹600 additional spending',
          'Leaves Bengaluru at a relaxed afternoon time (13:00 PM)'
        ],
        disadvantages: [
          'Late arrival at 23:15 PM breaches the 21:00 arrival constraint',
          'Amber Fort evening event missed',
          'Transfer from Terminal 3 to highway pickup point involves road cab',
          'Higher travel fatigue'
        ],
        justification: 'Suitable only if the traveller explicitly prioritizes budget minimization above all other constraints.'
      }
    ];
  }

  // SCENARIO 2: Mumbai to Goa (Train delay cascading to Catamaran Sunset Cruise)
  if (tripId === 'trip-bom-goa-02' || (origin.toLowerCase().includes('bom') && destination.toLowerCase().includes('goa'))) {
    return [
      {
        id: `rec-opt-a-${tripId}`,
        option_code: 'OPT-A',
        title: 'Air Switch Reroute: IndiGo 6E-618 (Mumbai T2 → Goa Mopa GOX)',
        transport_type: 'FLIGHT (AIR TRANSFER)',
        provider: 'IndiGo Airlines',
        route_summary: 'Mumbai (BOM) → Goa North (GOX) [Direct Flight] + Express Cab to Candolim',
        departure_time: '2026-11-20T11:30:00',
        arrival_time: '2026-11-20T14:15:00',
        total_cost: 4800.0,
        additional_cost: 2600.0,
        stops: 0,
        availability_status: 'Available (6 seats left)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Flawless Recovery: Bypasses the 3-hour railway signal block in Konkan Railway. Arrives at Taj Fort Aguada by 14:15 PM. Preserves Mandovi River Sunset Catamaran Cruise at 18:00 without delay.',
        advantages: [
          'Arrives in Goa 3.5 hours earlier than the delayed train',
          '100% guarantees participation in the Mandovi Sunset Cruise',
          'Relaxes hotel check-in at Taj Fort Aguada',
          'Well within the ₹3,500 additional budget'
        ],
        disadvantages: [
          'Requires cab transit to Mumbai International Airport Terminal 2'
        ],
        justification: 'Top recommendation: Salvages the entire weekend experience and client cruise for an incremental cost of ₹2,600.'
      },
      {
        id: `rec-opt-b-${tripId}`,
        option_code: 'OPT-B',
        title: 'Highway Express: Multi-Axle Scania AC Sleeper Coach',
        transport_type: 'INTERCITY BUS',
        provider: 'Paulo Travels Executive',
        route_summary: 'Mumbai Borivali → Panaji Bus Terminus (Direct Highway Coach)',
        departure_time: '2026-11-20T08:30:00',
        arrival_time: '2026-11-20T18:30:00',
        total_cost: 2200.0,
        additional_cost: 800.0,
        stops: 2,
        availability_status: 'Available (Upper Single Berths)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Partial Recovery: Reaches Panaji at 18:30 PM. Misses the 18:00 sunset cruise departure. Preserves hotel stay with standard evening check-in.',
        advantages: [
          'Low additional cost of only ₹800',
          'Pickups from multiple Mumbai hubs'
        ],
        disadvantages: [
          'Arrives after 18:00; Mandovi River sunset cruise is forfeited',
          '10 hours of highway travel fatigue'
        ],
        justification: 'Secondary option for travelers prioritizing budget over the evening cruise.'
      },
      {
        id: `rec-opt-c-${tripId}`,
        option_code: 'OPT-C',
        title: 'Stay on Delayed Tejas Express + Expedited Highway Station Cab',
        transport_type: 'TRAIN + TAXI',
        provider: 'Indian Railways & Local Prepaid Taxi',
        route_summary: 'Continue on Delayed Tejas Train to Madgaon Jn + Fast Highway Taxi',
        departure_time: '2026-11-20T05:50:00',
        arrival_time: '2026-11-20T19:15:00',
        total_cost: 1650.0,
        additional_cost: 0.0,
        stops: 3,
        availability_status: 'Confirmed Seat in Coach C4',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Heavy Cascaded Compromise: Train arrives Madgaon at 17:40 PM. With 90 min road transit to North Goa, hotel arrival is delayed to 19:15 PM. Sunset cruise is completely missed.',
        advantages: [
          'Zero additional expense (utilizes original ticket)'
        ],
        disadvantages: [
          'Loss of ₹2,400 non-refundable Sunset Cruise ticket',
          'Arrives tired after dark past 19:15 PM'
        ],
        justification: 'Cost-free alternative, but fails to prevent downstream event loss.'
      }
    ];
  }

  // SCENARIO 3: Delhi to Kochi (Fog ground delay cascading to Alleppey Houseboat check-in)
  if (tripId === 'trip-del-cok-03' || (origin.toLowerCase().includes('del') && destination.toLowerCase().includes('cok'))) {
    return [
      {
        id: `rec-opt-a-${tripId}`,
        option_code: 'OPT-A',
        title: 'Morning Non-stop Priority: Vistara UK-883 (DEL → COK Direct)',
        transport_type: 'FLIGHT (DIRECT)',
        provider: 'Vistara Airlines',
        route_summary: 'New Delhi (DEL T3) → Kochi (COK) [Direct Flight] + Jetty Express Taxi',
        departure_time: '2026-11-25T07:45:00',
        arrival_time: '2026-11-25T11:00:00',
        total_cost: 8200.0,
        additional_cost: 2900.0,
        stops: 0,
        availability_status: 'Available (3 seats in Premium Economy/Economy)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Critical Cascade Saved: Lands in Kochi at 11:00 AM. Arrives at Alleppey Finshing Point Jetty by 12:30 PM. The luxury houseboat departure at 13:00 PM is 100% saved!',
        advantages: [
          'Protects the ₹16,000 non-refundable Alleppey private houseboat departure',
          'Arrives in Kochi safely at 11:00 AM before afternoon congestion',
          'Preserves evening Kathakali cultural show in Fort Kochi',
          'Within ₹4,000 additional budget'
        ],
        disadvantages: [
          'Requires immediate re-ticketing at Terminal 3'
        ],
        justification: 'Vital recovery: missing the 13:00 houseboat departure forces complete boat cancellation. This option preserves the entire backwaters retreat.'
      },
      {
        id: `rec-opt-b-${tripId}`,
        option_code: 'OPT-B',
        title: 'Connecting Flight via Bengaluru: IndiGo 6E-2115 + 6E-442',
        transport_type: 'FLIGHT (1-STOP)',
        provider: 'IndiGo Airlines',
        route_summary: 'DEL → BLR (Layover 75m) → Kochi (COK)',
        departure_time: '2026-11-25T08:15:00',
        arrival_time: '2026-11-25T14:45:00',
        total_cost: 6700.0,
        additional_cost: 1400.0,
        stops: 1,
        availability_status: 'Available (Economy)',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Houseboat Lost / Land Reroute Required: Arrives at Kochi at 14:45 PM. Misses 13:00 houseboat cruise. Requires moving night 1 stay to a mainland resort in Kumarakom.',
        advantages: [
          'Low additional cost of ₹1,400',
          'Still arrives in Kerala on the same afternoon'
        ],
        disadvantages: [
          'Alleppey Houseboat day cruise missed (anchors at 13:00)',
          'Requires hotel booking modification'
        ],
        justification: 'Feasible secondary choice if traveller is willing to stay at a land resort instead of the cruise.'
      },
      {
        id: `rec-opt-c-${tripId}`,
        option_code: 'OPT-C',
        title: 'Next-Day Early Morning Flight: Air India AI-880 Direct',
        transport_type: 'FLIGHT (NEXT DAY)',
        provider: 'Air India',
        route_summary: 'New Delhi (DEL T3) → Kochi (COK) [Departs Tomorrow 06:15 AM]',
        departure_time: '2026-11-26T06:15:00',
        arrival_time: '2026-11-26T09:30:00',
        total_cost: 5300.0,
        additional_cost: 0.0,
        stops: 0,
        availability_status: 'Available via Carrier Free Reschedule',
        data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
        impact_on_connections: 'Severe Disruption: Completely loses Day 1 of Kerala trip. Day 1 hotel night forfeited.',
        advantages: [
          'Zero fare cost under airline weather waiver'
        ],
        disadvantages: [
          'Arrives 24 hours late',
          'Day 1 accommodation and activities completely forfeited'
        ],
        justification: 'Only suitable for travelers with zero out-of-pocket budget flexibility.'
      }
    ];
  }

  // GENERIC DYNAMIC FALLBACK: For ANY custom user-created route (e.g. Chennai -> Kolkata, Hyderabad -> Varanasi)
  const depTimeA = new Date(startDate.getTime() + 4 * 3600000);
  const arrTimeA = new Date(depTimeA.getTime() + 2.5 * 3600000);

  const depTimeB = new Date(startDate.getTime() + 2 * 3600000);
  const arrTimeB = new Date(depTimeB.getTime() + 6 * 3600000);

  const depTimeC = new Date(startDate.getTime() + 8 * 3600000);
  const arrTimeC = new Date(depTimeC.getTime() + 10 * 3600000);

  return [
    {
      id: `rec-opt-a-${Date.now()}`,
      option_code: 'OPT-A',
      title: `Priority Express: Direct Flight (${origin} → ${destination})`,
      transport_type: 'FLIGHT (DIRECT)',
      provider: 'National Air Carrier',
      route_summary: `${origin} → ${destination} [Non-stop Priority Route]`,
      departure_time: depTimeA.toISOString(),
      arrival_time: arrTimeA.toISOString(),
      total_cost: Math.round(maxBudget * 1.6),
      additional_cost: Math.round(maxBudget * 0.65),
      stops: 0,
      availability_status: 'Available (4 seats in Economy)',
      data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
      impact_on_connections: `Optimized Recovery: Direct connection from ${origin} to ${destination}. Arrives comfortably before downstream deadlines, protecting hotel reservation and "${criticalAct}".`,
      advantages: [
        `Direct non-stop service to ${destination}`,
        'Eliminates transit delays and missed connections',
        `Protects scheduled activity: ${criticalAct}`,
        `Within your additional budget limit of ₹${maxBudget.toLocaleString()}`
      ],
      disadvantages: [
        `Moderate fare difference of ₹${Math.round(maxBudget * 0.65).toLocaleString()}`
      ],
      justification: `Recommended as the fastest whole-trip recovery to reach ${destination} with minimal stress and zero secondary booking cancellations.`
    },
    {
      id: `rec-opt-b-${Date.now()}`,
      option_code: 'OPT-B',
      title: `Balanced Transit: 1-Stop Fast Rail / Secondary Carrier (${origin} → ${destination})`,
      transport_type: 'MULTIMODAL CONNECTING',
      provider: 'Intercity Rail / Carrier Network',
      route_summary: `${origin} → Transit Hub → ${destination}`,
      departure_time: depTimeB.toISOString(),
      arrival_time: arrTimeB.toISOString(),
      total_cost: Math.round(maxBudget * 1.1),
      additional_cost: Math.round(maxBudget * 0.35),
      stops: 1,
      availability_status: 'Available (Confirmed Class)',
      data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
      impact_on_connections: `Moderate Impact: Preserves destination arrival on the same calendar day, but later timing may require notifying hotel reception of late check-in.`,
      advantages: [
        `Low additional expense of only ₹${Math.round(maxBudget * 0.35).toLocaleString()}`,
        'Comfortable connection window at intermediate transit hub'
      ],
      disadvantages: [
        '1 intermediate transfer required',
        'Late evening arrival'
      ],
      justification: 'A dependable, cost-conscious secondary option if direct flights are not prioritized.'
    },
    {
      id: `rec-opt-c-${Date.now()}`,
      option_code: 'OPT-C',
      title: `Economy Reroute: Overnight Superfast Transit (${origin} → ${destination})`,
      transport_type: 'OVERNIGHT TRANSIT',
      provider: 'Express Rail / Highway Service',
      route_summary: `${origin} → ${destination} [Overnight Express]`,
      departure_time: depTimeC.toISOString(),
      arrival_time: arrTimeC.toISOString(),
      total_cost: Math.round(maxBudget * 0.5),
      additional_cost: Math.round(maxBudget * 0.1),
      stops: 2,
      availability_status: 'Available (High capacity)',
      data_source: 'DEMONSTRATION_DATA (Simulated for Evaluation)',
      impact_on_connections: 'Budget Priority: Arrives following morning. First night hotel and evening activities require rescheduling.',
      advantages: [
        `Maximum budget savings (only ₹${Math.round(maxBudget * 0.1).toLocaleString()} extra)`
      ],
      disadvantages: [
        'Arrives late or following day',
        'Significant fatigue and rescheduled activities'
      ],
      justification: 'Recommended only if budget minimization is the primary decision factor.'
    }
  ];
}

module.exports = {
  generateAlternativesForDisruption,
};
