import assert from 'node:assert';
import { evaluateHealth } from '../utils/health.js';

console.log('Running health.test.js...');

// Test 1: Perfect score
const h1 = evaluateHealth({ trip: { days: 2, budget: 1000 }, activities: [{ title: 'فندق', category: 'accommodation', cost: 200 }, { title: 'مطعم غداء', cost: 50 }, { title: 'مطعم عشاء', cost: 50 }] });
assert.strictEqual(h1.badge, '🟢');

// Test 2: Over budget
const h2 = evaluateHealth({ trip: { days: 1, budget: 100 }, activities: [{ cost: 200 }] });
assert.strictEqual(h2.checks.some(c => c.type === 'red'), true);

// Test 3: No hotel for multi-day
const h3 = evaluateHealth({ trip: { days: 3, budget: 1000 }, activities: [] });
assert.strictEqual(h3.checks.some(c => c.message.includes('مكان الإقامة')), true);

// Test 4: Heavy pace
const h4 = evaluateHealth({ trip: { days: 1 }, activities: [1,2,3,4,5,6] });
assert.strictEqual(h4.checks.some(c => c.message.includes('مزدحم')), true);

// Test 5: Bad weather impact
const h5 = evaluateHealth({ weatherDaily: [{ pop: 80 }] });
assert.strictEqual(h5.checks.some(c => c.message.includes('ممطر')), true);

console.log('5/5 PASS: health.test.js');
