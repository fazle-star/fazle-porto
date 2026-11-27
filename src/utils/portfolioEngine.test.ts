import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePortalProgress,
  computePortalTransform,
  computePortalBoxDimensions,
  computeDualPortalMetrics,
  toggleFlippedProjectId,
  computeParticleSpeed,
  getBrandDisplayName,
  filterProjectsByTech,
  validateContactForm,
  computePreloaderProgress,
  formatYogyakartaTime,
  resolveCursorMode,
  computeSpringStep,
} from './portfolioEngine';
import { PORTFOLIO_DATA } from '../data/portfolio';

test('computePortalBoxDimensions expands from arch size to full viewport bounds', () => {
  const start = computePortalBoxDimensions(0, 1440, 900);
  assert.deepEqual(start, { width: 440, height: 540 });

  const mobileStart = computePortalBoxDimensions(0, 390, 844);
  assert.deepEqual(mobileStart, { width: 300, height: 420 });

  const end = computePortalBoxDimensions(0.85, 1440, 900);
  assert.deepEqual(end, { width: 1440, height: 900 });
});

test('computeDualPortalMetrics places portals side-by-side at rest and zooms active while receding inactive', () => {
  const leftRest = computeDualPortalMetrics(0, 1440, 900, 'workspace', 'workspace');
  const rightRest = computeDualPortalMetrics(0, 1440, 900, 'bio', 'workspace');

  assert.ok(leftRest.offsetX < 0);
  assert.ok(rightRest.offsetX > 0);
  assert.equal(leftRest.scale, 1);
  assert.equal(leftRest.opacity, 1);
  assert.ok(rightRest.scale < 1);
  assert.ok(rightRest.opacity < 1);

  const bioActiveZoomed = computeDualPortalMetrics(1, 1440, 900, 'bio', 'bio');
  const workspaceReceded = computeDualPortalMetrics(1, 1440, 900, 'workspace', 'bio');

  assert.equal(bioActiveZoomed.offsetX, 0);
  assert.equal(bioActiveZoomed.width, 1440);
  assert.equal(bioActiveZoomed.height, 900);
  assert.equal(bioActiveZoomed.innerOpacity, 1);
  assert.equal(workspaceReceded.opacity, 0);
  assert.equal(workspaceReceded.isReceding, true);
});

test('toggleFlippedProjectId flips and unflips cards cleanly', () => {
  const once = toggleFlippedProjectId([], 'sipandu');
  assert.deepEqual(once, ['sipandu']);

  const twice = toggleFlippedProjectId(once, 'absen-resto');
  assert.deepEqual(twice, ['sipandu', 'absen-resto']);

  const unflipped = toggleFlippedProjectId(twice, 'sipandu');
  assert.deepEqual(unflipped, ['absen-resto']);
});

test('computePortalProgress clamps between 0 and 1 across portal track', () => {
  assert.equal(computePortalProgress(200, 2800, 1000), 0);
  assert.equal(computePortalProgress(0, 2800, 1000), 0);
  assert.equal(computePortalProgress(-900, 2800, 1000), 0.5);
  assert.equal(computePortalProgress(-1800, 2800, 1000), 1);
  assert.equal(computePortalProgress(-2500, 2800, 1000), 1);
});

test('computePortalTransform interpolates scale, border-radius, and 3D depth', () => {
  const start = computePortalTransform(0);
  assert.equal(start.scale, 1);
  assert.equal(start.borderRadiusTop, 220);
  assert.equal(start.borderRadiusBottom, 28);
  assert.equal(start.previewOpacity, 1);
  assert.equal(start.innerOpacity, 0);
  assert.equal(start.innerTranslateZ, -250);

  const mid = computePortalTransform(0.5);
  assert.ok(mid.scale > 1 && mid.scale < 15);
  assert.equal(mid.previewOpacity, 0);
  assert.ok(mid.innerOpacity > 0 && mid.innerOpacity < 1);
  assert.ok(mid.innerTranslateZ > -250 && mid.innerTranslateZ < 0);

  const end = computePortalTransform(1);
  assert.equal(end.scale, 15);
  assert.equal(end.borderRadiusTop, 0);
  assert.equal(end.borderRadiusBottom, 0);
  assert.equal(end.previewOpacity, 0);
  assert.equal(end.innerOpacity, 1);
  assert.equal(end.innerTranslateZ, 0);
});

test('computeParticleSpeed accelerates linearly with portal zoom velocity', () => {
  assert.equal(computeParticleSpeed(0.4, 0), 0.4);
  assert.equal(computeParticleSpeed(0.4, 1), 2);
});

test('getBrandDisplayName switches between Fazle on mobile and full name on desktop', () => {
  assert.equal(getBrandDisplayName(390), 'Fazle');
  assert.equal(getBrandDisplayName(767), 'Fazle');
  assert.equal(getBrandDisplayName(768), 'Muhammad Fazle Ferino');
  assert.equal(getBrandDisplayName(1440), 'Muhammad Fazle Ferino');
});

test('filterProjectsByTech filters projects cleanly and returns all when null', () => {
  const all = filterProjectsByTech(PORTFOLIO_DATA.projects.items, null);
  assert.equal(all.length, 4);

  const reactProjects = filterProjectsByTech(PORTFOLIO_DATA.projects.items, 'React');
  assert.equal(reactProjects.length, 3);

  const pythonProjects = filterProjectsByTech(PORTFOLIO_DATA.projects.items, 'Python');
  assert.equal(pythonProjects.length, 1);
  assert.equal(pythonProjects[0].id, 'pythonverse-learning-hub');
});

test('validateContactForm rejects invalid inputs and accepts complete entries', () => {
  const invalid = validateContactForm({ name: 'A', email: 'bad', message: 'short' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.message);

  const valid = validateContactForm({
    name: 'Rafi Pratama',
    email: 'rafi@example.com',
    message: 'Interested in collaborating on a security audit and web build.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('computePreloaderProgress eases cleanly from 0 to 100 and snaps under reduced motion', () => {
  assert.equal(computePreloaderProgress(0, 1400), 0);
  const mid = computePreloaderProgress(700, 1400);
  assert.ok(mid > 50 && mid < 100);
  assert.equal(computePreloaderProgress(1400, 1400), 100);
  assert.equal(computePreloaderProgress(2200, 1400), 100);
  assert.equal(computePreloaderProgress(0, 1400, true), 100);
});

test('formatYogyakartaTime formats UTC timestamps cleanly in Asia/Jakarta WIB', () => {
  const sampleUtc = new Date('2026-11-27T05:15:30Z'); // 12:15:30 WIB (UTC+7)
  assert.equal(formatYogyakartaTime(sampleUtc), '12:15:30');
});

test('resolveCursorMode differentiates project rows, links/buttons, and default canvas', () => {
  assert.equal(resolveCursorMode('case', 'BUTTON'), 'case');
  assert.equal(resolveCursorMode(undefined, 'A'), 'link');
  assert.equal(resolveCursorMode(undefined, 'BUTTON'), 'link');
  assert.equal(resolveCursorMode(undefined, 'DIV', 'button'), 'link');
  assert.equal(resolveCursorMode(undefined, 'DIV'), 'default');
});

test('computeSpringStep interpolates proportionally toward target', () => {
  assert.equal(computeSpringStep(0, 100, 0.2), 20);
  assert.equal(computeSpringStep(50, 50, 0.2), 50);
});


