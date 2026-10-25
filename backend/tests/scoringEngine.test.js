const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreRecoveryOption, evaluateAndRankOptions } = require('../src/engine/scoringEngine');

test('Scoring Engine: Penalizes option exceeding traveller budget', () => {
  const option = {
    id: 'opt-expensive',
    title: 'Charter Flight',
    route_summary: 'BLR -> JAI Direct',
    departure_time: '2026-11-15T11:00:00',
    arrival_time: '2026-11-15T13:30:00',
    additional_cost: 8500.0, // Exceeds budget 4500
    stops: 0,
  };

  const constraints = {
    max_additional_budget: 4500.0,
    preferred_arrival_deadline: '2026-11-15T21:00:00',
  };

  const scored = scoreRecoveryOption(option, constraints, [], {});
  assert.equal(scored.constraints_audit.isBudgetCompliant, false);
  assert.ok(scored.score_factors.budget.score < 10, 'Budget score should be heavily penalized');
  assert.equal(scored.constraints_audit.relaxationOptions[0].type, 'RELAX_BUDGET');
});

test('Scoring Engine: Ranks Direct Flight with preserved activities as top recommendation', () => {
  const optA = {
    id: 'opt-a',
    option_code: 'OPT-A',
    title: 'Direct Flight Air India',
    route_summary: 'BLR -> JAI Direct',
    departure_time: '2026-11-15T11:15:00',
    arrival_time: '2026-11-15T13:45:00',
    additional_cost: 3200.0,
    stops: 0,
  };

  const optB = {
    id: 'opt-b',
    option_code: 'OPT-B',
    title: 'Connecting Train Evening',
    route_summary: 'BLR -> DEL + Shatabdi',
    departure_time: '2026-11-15T09:30:00',
    arrival_time: '2026-11-15T22:40:00', // Past 21:00 deadline
    additional_cost: 1800.0,
    stops: 1,
  };

  const constraints = {
    max_additional_budget: 4500.0,
    preferred_arrival_deadline: '2026-11-15T21:00:00',
    critical_activities: 'Amber Fort',
  };

  const ranked = evaluateAndRankOptions([optA, optB], constraints, [], {});
  assert.equal(ranked[0].id, 'opt-a', 'Direct flight arriving at 13:45 should score highest');
  assert.equal(ranked[0].is_recommended, true);
  assert.ok(ranked[0].overall_score > ranked[1].overall_score, 'Score for Opt A should exceed Opt B');
});
