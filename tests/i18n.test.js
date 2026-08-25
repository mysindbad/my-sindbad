import assert from 'node:assert';
import { translations, getTranslation } from '../utils/i18n.js';

console.log('Running i18n.test.js...');

// Test 1: Dictionary parity
const arKeys = Object.keys(translations.ar).sort();
const enKeys = Object.keys(translations.en).sort();
assert.deepStrictEqual(arKeys, enKeys, 'AR and EN translation keys must match exactly');

// Test 2: Translation retrieval fallback
assert.strictEqual(getTranslation('ar', 'nav_home'), 'الرئيسية');
assert.strictEqual(getTranslation('en', 'nav_home'), 'Home');
assert.strictEqual(getTranslation('ar', 'non_existing_key'), 'non_existing_key');

console.log('2/2 PASS: i18n.test.js');
