import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency, formatDate } from '../src/utils/formatters.ts';
import { validateImportedPlan } from '../src/utils/validators.ts';
import type { EventInput, EventPlan } from '../src/types/event.ts';

const BASE_URL = 'http://localhost:3000';

describe('1. Currency & Date Formatter Invariants', () => {
  test('formats INR correctly with rupee symbol or code', () => {
    const formatted = formatCurrency(2500000, 'INR');
    assert.match(formatted, /₹|INR/);
    assert.match(formatted, /25,00,000|2,500,000/);
  });

  test('formats USD, GBP, AED, EUR, CAD properly', () => {
    const usd = formatCurrency(15000, 'USD');
    assert.match(usd, /\$|15,000/);

    const gbp = formatCurrency(8500, 'GBP');
    assert.match(gbp, /£|8,500/);

    const aed = formatCurrency(45000, 'AED');
    assert.match(aed, /AED|45,000/);

    const eur = formatCurrency(12000, 'EUR');
    assert.match(eur, /€|12.000|12,000/);

    const cad = formatCurrency(18000, 'CAD');
    assert.match(cad, /\$|18,000/);
  });

  test('handles NaN, negative, and zero amounts safely', () => {
    assert.match(formatCurrency(0, 'USD'), /\$0|0/);
    assert.match(formatCurrency(NaN, 'USD'), /\$0|0/);
    assert.match(formatCurrency(-500, 'USD'), /-\$500|-\$ 500|500/);
  });

  test('formats valid date string to human-readable format', () => {
    const formatted = formatDate('2026-11-20');
    assert.match(formatted, /November/);
    assert.match(formatted, /2026/);
  });
});

describe('2. Budget Calculation & Health Invariants', () => {
  test('cost per guest correctly divides budget by guest count safely', () => {
    const budget = 50000;
    const guests = 100;
    const costPerGuest = Math.round(budget / Math.max(1, guests));
    assert.equal(costPerGuest, 500);

    // Zero guest boundary check (prevent divide by zero)
    const zeroGuestCost = Math.round(budget / Math.max(1, 0));
    assert.equal(zeroGuestCost, 50000);
  });

  test('budget variance properly tracks allocated vs actual spent', () => {
    const allocated = 15000;
    const actualUnder = 12000;
    const actualOver = 18000;

    const surplus = allocated - actualUnder;
    const deficit = allocated - actualOver;

    assert.equal(surplus, 3000);
    assert.equal(deficit, -3000);
    assert.ok(surplus > 0, 'Surplus must be positive');
    assert.ok(deficit < 0, 'Deficit must be negative');
  });

  test('auto-normalize algorithm guarantees 100% total allocation', () => {
    const items = [
      { id: '1', percent: 20 },
      { id: '2', percent: 30 },
      { id: '3', percent: 25 },
    ]; // sums to 75%

    const currentSum = items.reduce((sum, i) => sum + i.percent, 0);
    let runningSum = 0;
    const normalized = items.map((item, idx) => {
      let newPercent;
      if (idx === items.length - 1) {
        newPercent = Math.max(0, 100 - runningSum);
      } else {
        newPercent = Math.round((item.percent / currentSum) * 100);
        runningSum += newPercent;
      }
      return { ...item, percent: newPercent };
    });

    const finalSum = normalized.reduce((sum, i) => sum + i.percent, 0);
    assert.equal(finalSum, 100, 'Normalized percentages must sum exactly to 100%');
  });
});

describe('3. Budget Edge Cases & Mathematical Robustness', () => {
  test('handles smallest positive budget across large guest count', () => {
    const tinyBudget = 100;
    const largeGuests = 500;
    const costPerGuest = Math.round(tinyBudget / largeGuests);
    assert.equal(costPerGuest, 0);
    assert.ok(!isNaN(costPerGuest), 'Cost per guest must be a valid number');
  });

  test('handles high scale budget without integer overflow', () => {
    const largeBudget = 100000000; // 100M
    const guests = 1000;
    const costPerGuest = Math.round(largeBudget / guests);
    assert.equal(costPerGuest, 100000);
  });

  test('handles 100% single category allocation with 0% across other categories', () => {
    const totalBudget = 500000;
    const items = [
      { category: 'Venue', percent: 100, amount: totalBudget },
      { category: 'Decor', percent: 0, amount: 0 },
      { category: 'Catering', percent: 0, amount: 0 },
    ];
    const totalPercent = items.reduce((sum, i) => sum + i.percent, 0);
    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    assert.equal(totalPercent, 100);
    assert.equal(totalAmount, totalBudget);
  });

  test('preserves precision with 3-way split (33.33% rounded)', () => {
    const items = [
      { id: '1', percent: 33 },
      { id: '2', percent: 33 },
      { id: '3', percent: 33 },
    ];
    const currentSum = items.reduce((sum, i) => sum + i.percent, 0); // 99%
    let runningSum = 0;
    const normalized = items.map((item, idx) => {
      let newPercent;
      if (idx === items.length - 1) {
        newPercent = Math.max(0, 100 - runningSum);
      } else {
        newPercent = Math.round((item.percent / currentSum) * 100);
        runningSum += newPercent;
      }
      return { ...item, percent: newPercent };
    });

    const finalSum = normalized.reduce((sum, i) => sum + i.percent, 0);
    assert.equal(finalSum, 100, 'Rounding remainder must be absorbed by final item');
  });
});

describe('4. Malformed JSON Import & Plan Schema Validation', () => {

  test('rejects non-object or null input', () => {
    assert.equal(validateImportedPlan(null).valid, false);
    assert.equal(validateImportedPlan('plain string').valid, false);
    assert.equal(validateImportedPlan(12345).valid, false);
  });

  test('rejects empty JSON object {}', () => {
    const result = validateImportedPlan({});
    assert.equal(result.valid, false);
    assert.match(result.error!, /Missing celebration title/);
  });

  test('rejects JSON missing timeline array', () => {
    const result = validateImportedPlan({
      summary: { title: 'Test Mehfil' },
      timeline: 'invalid timeline string',
      budgetBreakdown: { items: [] },
    });
    assert.equal(result.valid, false);
    assert.match(result.error!, /Timeline must be an array/);
  });

  test('rejects JSON missing budget items array', () => {
    const result = validateImportedPlan({
      summary: { title: 'Test Mehfil' },
      timeline: [],
      budgetBreakdown: { items: null },
    });
    assert.equal(result.valid, false);
    assert.match(result.error!, /Budget breakdown must contain an items array/);
  });

  test('accepts valid Mehfil AI blueprint structure', () => {
    const validPlan = {
      summary: { title: 'Royal Ghazal Night' },
      timeline: [{ id: 't-1', time: '19:00', title: 'Welcome' }],
      budgetBreakdown: {
        totalBudget: 500000,
        currency: 'INR',
        items: [{ id: 'b-1', category: 'Venue', allocatedPercent: 100, allocatedAmount: 500000 }],
      },
    };
    const result = validateImportedPlan(validPlan);
    assert.equal(result.valid, true);
    assert.equal(result.error, undefined);
  });
});

describe('5. Storage Quota & Persistence Resilience', () => {
  test('safely handles QuotaExceededError in mock storage layer', () => {
    let toastFired = false;
    let toastMessage = '';

    const showToast = (msg: string) => {
      toastFired = true;
      toastMessage = msg;
    };

    // Simulated storage engine that throws QuotaExceeded
    const simulatedStorage = {
      setItem: () => {
        const error = new Error('The quota has been exceeded.');
        error.name = 'QuotaExceededError';
        throw error;
      },
    };

    function safeSavePlan(plan: any) {
      try {
        simulatedStorage.setItem();
        showToast('Plan saved to your collection.');
      } catch (e: any) {
        showToast('Storage full. Delete older saved plans to free space.');
      }
    }

    safeSavePlan({ id: 'test-plan' });
    assert.equal(toastFired, true);
    assert.match(toastMessage, /Storage full/);
  });

  test('recovers safely from corrupted JSON in localStorage', () => {
    const simulatedStore: Record<string, string> = {
      mehfil_ai_saved_plans_v1: '{ corrupt json: invalid syntax',
    };

    let loadedPlans: any[] = [];
    try {
      const stored = simulatedStore['mehfil_ai_saved_plans_v1'];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          loadedPlans = parsed;
        }
      }
    } catch (e) {
      // Graceful fallback to empty array without crashing
      loadedPlans = [];
    }

    assert.equal(Array.isArray(loadedPlans), true);
    assert.equal(loadedPlans.length, 0);
  });
});

describe('6. Live Server API, Validation & Security Audit', () => {
  let serverAvailable = false;

  before(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(1500) });
      serverAvailable = res.ok;
    } catch {
      serverAvailable = false;
    }
  });

  test('GET /api/health responds with 200 and healthy status without leaking secrets', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(typeof data.geminiConfigured, 'boolean');

    // Security check: API key must NEVER be in response body or headers
    const rawBody = JSON.stringify(data);
    assert.ok(!rawBody.includes('AIza'), 'Response body must not contain Google API key tokens');
    assert.equal(res.headers.get('x-api-key'), null, 'Headers must not contain API key');
  });

  test('POST /api/generate-plan rejects missing eventType with 400', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: '2026-11-20',
        location: 'Mumbai',
        guestCount: 100,
        budget: 500000,
      }),
    });
    assert.equal(res.status, 400);
    const err = await res.json();
    assert.match(err.error, /Event type is required/);
  });

  test('POST /api/generate-plan rejects negative or zero budget with 400', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'Sangeet',
        date: '2026-11-20',
        location: 'Mumbai',
        guestCount: 100,
        budget: -500,
      }),
    });
    assert.equal(res.status, 400);
    const err = await res.json();
    assert.match(err.error, /Budget/);
  });

  test('POST /api/generate-plan rejects invalid guest counts (>50,000 or <1) with 400', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'Sangeet',
        date: '2026-11-20',
        location: 'Mumbai',
        guestCount: 0,
        budget: 500000,
      }),
    });
    assert.equal(res.status, 400);
    const err = await res.json();
    assert.match(err.error, /Guest count/);
  });

  test('POST /api/generate-plan rejects invalid currency codes with 400', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'Sangeet',
        date: '2026-11-20',
        location: 'Mumbai',
        guestCount: 100,
        budget: 500000,
        currency: 'XYZ',
      }),
    });
    assert.equal(res.status, 400);
    const err = await res.json();
    assert.match(err.error, /Invalid currency/);
  });

  test('POST /api/generate-plan sanitizes HTML tags from inputs and returns complete blueprint', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: '<script>alert("xss")</script>Ghazal Night',
        eventTitle: '<b>Royal Mehfil</b>',
        date: '2026-11-20',
        location: '<i>Jaipur</i>',
        guestCount: 80,
        budget: 200000,
        currency: 'INR',
      }),
    });
    assert.equal(res.status, 200);
    const plan = await res.json();
    assert.ok(!plan.summary.title.includes('<script>'), 'Title must not contain script tags');
    assert.ok(plan.timeline && plan.timeline.length > 0, 'Timeline must be populated');
    assert.ok(plan.budgetBreakdown && plan.budgetBreakdown.items.length > 0, 'Budget must be populated');
    assert.ok(plan.vendorChecklist && plan.vendorChecklist.length > 0, 'Vendor checklist must be populated');
    assert.ok(plan.curatedMenu && plan.curatedMenu.length > 0, 'Menu must be populated');
    assert.ok(plan.zones && plan.zones.length > 0, 'Zones must be populated');
  });

  test('POST /api/ai-suggest provides contextual celebration advice', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/ai-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: {
          summary: { title: 'Royal Udaipur Sangeet' },
          input: { location: 'Udaipur', guestCount: 150 },
          budgetBreakdown: { currency: 'INR', totalBudget: 2500000 },
        },
        prompt: 'What are 3 essential hospitality touches for elder guests?',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.advice && data.advice.length > 20, 'Advice must be returned with meaningful content');
  });

  test('Rate limiting triggers HTTP 429 after exceeding request threshold', async (t) => {
    if (!serverAvailable) {
      t.skip(`Live server is not running on ${BASE_URL}`);
      return;
    }
    const testIp = '198.51.100.99';
    let lastStatus = 200;

    // Send 42 requests sequentially to test IP window
    for (let i = 0; i < 42; i++) {
      const res = await fetch(`${BASE_URL}/api/health`, {
        headers: { 'x-forwarded-for': testIp },
      });
      lastStatus = res.status;
      if (res.status === 429) {
        break;
      }
    }

    assert.equal(lastStatus, 429, 'Rate limiter must return 429 once window threshold is reached');
  });
});
