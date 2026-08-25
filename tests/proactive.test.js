import assert from 'node:assert';
import { evaluateAlerts } from '../utils/proactive.js';

console.log('Running proactive.test.js...');

// Test 1: Rain alert trigger
const alerts1 = evaluateAlerts({ weatherDaily: [{ pop: 70 }] });
assert.strictEqual(alerts1.length, 1);
assert.strictEqual(alerts1[0].category, 'weather');

// Test 2: Density alert trigger
const alerts2 = evaluateAlerts({ daysActivities: [{ activities: [1,2,3,4,5,6] }] });
assert.strictEqual(alerts2.length, 1);
assert.strictEqual(alerts2[0].category, 'density');

// Test 3: Budget alert trigger
const alerts3 = evaluateAlerts({ budget: 1000, currentSpent: 950 });
assert.strictEqual(alerts3.length, 1);
assert.strictEqual(alerts3[0].category, 'budget');

// Test 4: Clear case
const alerts4 = evaluateAlerts({ weatherDaily: [{ pop: 10 }], daysActivities: [{ activities: [1,2] }], budget: 1000, currentSpent: 100 });
assert.strictEqual(alerts4.length, 0);

console.log('4/4 PASS: proactive.test.js');
