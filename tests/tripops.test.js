import assert from 'node:assert';
import { removeActivity, moveActivity, delayDay } from '../utils/tripops.js';

console.log('Running tripops.test.js...');

const sampleTrip = {
  days: [
    { day: 1, activities: [{ title: 'A1' }, { title: 'A2' }] },
    { day: 2, activities: [{ title: 'B1' }] }
  ]
};

// Test 1: removeActivity
const t1 = removeActivity(sampleTrip, 1, 0);
assert.strictEqual(t1.days[0].activities.length, 1);
assert.strictEqual(t1.days[0].activities[0].title, 'A2');

// Test 2: moveActivity
const t2 = moveActivity(sampleTrip, 1, 0, 2);
assert.strictEqual(t2.days[0].activities.length, 1);
assert.strictEqual(t2.days[1].activities.length, 2);
assert.strictEqual(t2.days[1].activities[1].title, 'A1');

// Test 3: delayDay
const t3 = delayDay(sampleTrip, 2);
assert.strictEqual(t3.delayedHours, 2);

// Test 4: Immutable check
assert.strictEqual(sampleTrip.days[0].activities.length, 2);

console.log('4/4 PASS: tripops.test.js');
