import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVoiceCommand,
  calculateUsagePercentage,
  filterPromptsByCategory,
  formatRelativeTime
} from './ai-logic';

test('parseVoiceCommand handles time queries', () => {
  const res = parseVoiceCommand('what time is it');
  assert.equal(res.intent, 'time');
  assert.match(res.responsePreview, /The current time is/);
});

test('parseVoiceCommand routes image generation intent', () => {
  const res = parseVoiceCommand('generate image of a cybernetic cat');
  assert.equal(res.intent, 'image');
  assert.equal(res.payload, 'a cybernetic cat');
});

test('parseVoiceCommand routes settings and story', () => {
  assert.equal(parseVoiceCommand('open settings').intent, 'settings');
  assert.equal(parseVoiceCommand('tell me a story').intent, 'story');
});

test('calculateUsagePercentage calculates clamped percentages correctly', () => {
  assert.equal(calculateUsagePercentage(46, 50), 92);
  assert.equal(calculateUsagePercentage(75, 100), 75);
  assert.equal(calculateUsagePercentage(150, 100), 100);
  assert.equal(calculateUsagePercentage(0, 100), 0);
  assert.equal(calculateUsagePercentage(10, 0), 0);
});

test('filterPromptsByCategory filters items correctly', () => {
  const items = [
    { title: 'Forest', category: 'Nature' },
    { title: 'Dragon', category: 'Fantasy' },
    { title: 'Robot', category: 'Technology' }
  ];
  assert.equal(filterPromptsByCategory(items, 'Nature').length, 1);
  assert.equal(filterPromptsByCategory(items, 'All').length, 3);
});

test('formatRelativeTime formats durations sensibly', () => {
  const now = Date.now();
  assert.equal(formatRelativeTime(now - 1000 * 10), 'Just now');
  assert.equal(formatRelativeTime(now - 1000 * 120), '2m ago');
  assert.equal(formatRelativeTime(now - 1000 * 3600), '1h ago');
});
