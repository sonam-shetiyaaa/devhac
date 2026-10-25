// TripRescue AI - Constraint & Disruption Scoring Engine
// Evaluates travel recovery alternatives against multi-dimensional traveller constraints and cascading impacts.

/**
 * Scores a single alternative recovery option.
 * @param {Object} option - The alternative option (times, costs, route, etc.)
 * @param {Object} constraints - Traveller constraints (budget, deadline, preferences)
 * @param {Array} bookings - Existing trip bookings
 * @param {Object} disruption - The reported disruption
 */
function scoreRecoveryOption(option, constraints, bookings, disruption) {
  const maxBudget = parseFloat(constraints?.max_additional_budget) || 5000.0;
  const deadline = constraints?.preferred_arrival_deadline ? new Date(constraints.preferred_arrival_deadline) : null;
  const criticalActivity = (constraints?.critical_activities || '').toLowerCase();

  const optDep = new Date(option.departure_time);
  const optArr = new Date(option.arrival_time);

  // 1. Timing & Arrival Score (35 pts max)
  let timeScore = 35;
  let timeExplanation = '';
  let deadlineViolated = false;

  if (deadline) {
    if (optArr.getTime() > deadline.getTime()) {
      deadlineViolated = true;
      const minsOver = Math.round((optArr.getTime() - deadline.getTime()) / 60000);
      const penalty = Math.min(25, Math.ceil(minsOver / 15) * 3);
      timeScore -= penalty;
      timeExplanation = `Arrives ${minsOver} mins after preferred deadline (${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) [-${penalty} pts]`;
    } else {
      const bufferMins = Math.round((deadline.getTime() - optArr.getTime()) / 60000);
      timeExplanation = `Arrives at ${optArr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${bufferMins} mins safely before ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} deadline.`;
    }
  } else {
    timeExplanation = `Estimated arrival at ${optArr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
  }

  // Overnight arrival penalty
  if (optArr.getDate() !== optDep.getDate()) {
    timeScore -= 12;
    timeExplanation += ' (Arrives on the following day)';
  }
  timeScore = Math.max(0, Math.min(35, Math.round(timeScore)));

  // 2. Budget & Cost Score (25 pts max)
  const addCost = parseFloat(option.additional_cost) || 0.0;
  let budgetScore = 25;
  let budgetExplanation = '';
  let budgetViolated = false;

  if (addCost <= 0) {
    budgetScore = 25;
    budgetExplanation = 'Zero additional cost (no fare differential).';
  } else if (addCost <= maxBudget) {
    const costRatio = addCost / maxBudget;
    budgetScore = Math.round(25 * (1 - (costRatio * 0.6)));
    budgetExplanation = `Additional cost of ₹${addCost.toLocaleString()} is within the ₹${maxBudget.toLocaleString()} limit.`;
  } else {
    budgetViolated = true;
    const overBudget = addCost - maxBudget;
    budgetScore = Math.max(0, Math.round(10 - (overBudget / 500)));
    budgetExplanation = `Exceeds max additional budget by ₹${overBudget.toLocaleString()} [Limit: ₹${maxBudget.toLocaleString()}].`;
  }
  budgetScore = Math.max(0, Math.min(25, budgetScore));

  // 3. Whole-Trip Cascade Resolution (25 pts max)
  let cascadeScore = 0;
  const cascadeDetails = [];

  // Does this option take traveller directly to final destination or preserve connecting train?
  const isDirectToDestination = option.route_summary.toLowerCase().includes('jaipur') || option.title.toLowerCase().includes('direct');
  if (isDirectToDestination) {
    cascadeScore += 10;
    cascadeDetails.push('Eliminates risky Delhi transfer by flying direct to destination');
  } else if (option.stops > 0) {
    cascadeScore += 5;
    cascadeDetails.push('Maintains transit connection with verified connection buffer');
  }

  // Hotel check-in impact
  const arrHour = optArr.getHours();
  if (arrHour < 20 && optArr.getDate() === optDep.getDate()) {
    cascadeScore += 8;
    cascadeDetails.push('Permits normal hotel check-in without special late arrival waiver');
  } else if (arrHour <= 22 && optArr.getDate() === optDep.getDate()) {
    cascadeScore += 5;
    cascadeDetails.push('Allows same-day hotel check-in with standard late arrival notification');
  } else {
    cascadeScore += 1;
    cascadeDetails.push('Requires hotel stay modification or risk of first night loss');
  }

  // Critical Activity preservation
  let activityPreserved = false;
  if (criticalActivity) {
    // Amber fort starts at 20:30 (requires arrival in Jaipur before 19:30)
    if (optArr.getHours() < 19 && optArr.getDate() === optDep.getDate()) {
      cascadeScore += 7;
      activityPreserved = true;
      cascadeDetails.push(`Successfully preserves "${constraints.critical_activities}"`);
    } else {
      activityPreserved = false;
      cascadeDetails.push(`Cannot make "${constraints.critical_activities}" at scheduled time (requires reschedule)`);
    }
  } else {
    cascadeScore += 7;
  }
  cascadeScore = Math.max(0, Math.min(25, cascadeScore));

  // 4. Travel Comfort & Convenience (15 pts max)
  let comfortScore = 15;
  let comfortExplanation = '';
  if (option.stops === 0) {
    comfortScore = 15;
    comfortExplanation = 'Direct journey with no intermediate airport or station transfers.';
  } else if (option.stops === 1) {
    comfortScore = 10;
    comfortExplanation = 'One connecting segment with comfortable layover.';
  } else {
    comfortScore = 5;
    comfortExplanation = 'Multi-segment journey with high transfer fatigue.';
  }

  // Overall Score
  const totalScore = Math.min(100, Math.max(0, timeScore + budgetScore + cascadeScore + comfortScore));

  // Constraints relaxation suggestions if conflicts exist
  const relaxationOptions = [];
  if (budgetViolated) {
    relaxationOptions.push({
      type: 'RELAX_BUDGET',
      title: 'Increase Additional Budget Limit',
      description: `Increase your budget ceiling by ₹${(addCost - maxBudget).toLocaleString()} to unlock this fast recovery.`,
    });
  }
  if (deadlineViolated) {
    relaxationOptions.push({
      type: 'RELAX_DEADLINE',
      title: 'Extend Arrival Deadline',
      description: `Accept arrival at ${optArr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} instead of preferred ${deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });
  }
  if (!activityPreserved && criticalActivity) {
    relaxationOptions.push({
      type: 'RESCHEDULE_ACTIVITY',
      title: 'Reschedule Important Activity',
      description: `Move "${constraints.critical_activities}" to tomorrow morning at 09:30 AM.`,
    });
  }

  return {
    ...option,
    overall_score: totalScore,
    score_factors: {
      time: { score: timeScore, max: 35, explanation: timeExplanation },
      budget: { score: budgetScore, max: 25, explanation: budgetExplanation },
      cascade: { score: cascadeScore, max: 25, explanation: cascadeDetails.join('. ') },
      comfort: { score: comfortScore, max: 15, explanation: comfortExplanation },
    },
    constraints_audit: {
      isBudgetCompliant: !budgetViolated,
      isDeadlineCompliant: !deadlineViolated,
      isCriticalActivityPreserved: activityPreserved,
      relaxationOptions,
    },
  };
}

/**
 * Compares and ranks all recovery options.
 */
function evaluateAndRankOptions(options, constraints, bookings, disruption) {
  const scored = options.map(opt => scoreRecoveryOption(opt, constraints, bookings, disruption));
  scored.sort((a, b) => b.overall_score - a.overall_score);

  // Set the top score as recommended
  if (scored.length > 0) {
    scored.forEach((opt, idx) => {
      opt.is_recommended = idx === 0;
    });
  }

  return scored;
}

module.exports = {
  scoreRecoveryOption,
  evaluateAndRankOptions,
};
