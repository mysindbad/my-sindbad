import assert from 'node:assert';
import { mergeTrips } from '../utils/sync.js';

console.log('Running sync.test.js...');

// Test 1: Choose remote when remote is newer
const local = { updatedAt: '2026-08-01T10:00:00Z', title: 'Local' };
const remote = { updatedAt: '2026-08-01T12:00:00Z', title: 'Remote' };
const res1 = mergeTrips(local, remote);
assert.strictEqual(res1.title, 'Remote');

// Test 2: Choose local when local is newer
const local2 = { updatedAt: '2026-08-01T15:00:00Z', title: 'Local' };
const remote2 = { updatedAt: '2026-08-01T12:00:00Z', title: 'Remote' };
const res2 = mergeTrips(local2, remote2);
assert.strictEqual(res2.title, 'Local');

// Test 3: Null safety
const res3 = mergeTrips(null, remote);
assert.strictEqual(res3.title, 'Remote');

console.log('3/3 PASS: sync.test.js');
