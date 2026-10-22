import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { EventInput, EventPlan, SuggestionRequest } from '../src/types/event';

// Server-side Gemini client initialization (API key strictly server-side)
export const apiKey = process.env.GEMINI_API_KEY;
export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory sliding window rate limiter
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;
const MAX_TRACKED_IPS = 5000;
let lastCleanupTime = Date.now();
const CLEANUP_INTERVAL_MS = 60 * 1000;

function cleanupExpiredEntries(now: number): void {
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now > record.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
  if (ipRequestCounts.size > MAX_TRACKED_IPS) {
    ipRequestCounts.clear();
  }
}

export function applyRateLimit(clientIp: string): boolean {
  const now = Date.now();

  // Lazy cleanup of expired entries without background timers (serverless and Express safe)
  if (now - lastCleanupTime > CLEANUP_INTERVAL_MS || ipRequestCounts.size > MAX_TRACKED_IPS) {
    cleanupExpiredEntries(now);
    lastCleanupTime = now;
  }

  const record = ipRequestCounts.get(clientIp);

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  } else if (record.count < MAX_REQUESTS_PER_WINDOW) {
    record.count++;
    return true;
  } else {
    return false;
  }
}

// Strip dangerous HTML/script tags
export function sanitizeText(str?: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

const ALLOWED_CURRENCIES = new Set(['INR', 'USD', 'GBP', 'AED', 'EUR', 'CAD']);

// Input sanitization & validation helper
export function validateEventInput(input: Partial<EventInput>): {
  valid: boolean;
  error?: string;
  sanitized?: EventInput;
} {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object.' };
  }

  if (!input.eventType || typeof input.eventType !== 'string') {
    return { valid: false, error: 'Event type is required.' };
  }
  const cleanEventType = sanitizeText(input.eventType);
  if (cleanEventType.length > 100) {
    return { valid: false, error: 'Event type exceeds maximum allowed length.' };
  }

  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: 'A valid event date (YYYY-MM-DD) is required.' };
  }

  if (!input.location || typeof input.location !== 'string' || input.location.trim().length === 0) {
    return { valid: false, error: 'Location / City is required.' };
  }
  const cleanLocation = sanitizeText(input.location);
  if (cleanLocation.length > 150) {
    return { valid: false, error: 'Location string is too long.' };
  }

  const guests = Number(input.guestCount);
  if (isNaN(guests) || !Number.isInteger(guests) || guests < 1 || guests > 50000) {
    return { valid: false, error: 'Guest count must be an integer between 1 and 50,000.' };
  }

  const budget = Number(input.budget);
  if (isNaN(budget) || budget <= 0 || budget > 1000000000) {
    return { valid: false, error: 'Budget must be a realistic positive amount.' };
  }

  const currency = (input.currency || 'INR') as EventInput['currency'];
  if (!ALLOWED_CURRENCIES.has(currency)) {
    return { valid: false, error: 'Invalid currency code.' };
  }

  const durationHours = Math.max(1, Math.min(48, Number(input.durationHours) || 5));

  const sanitized: EventInput = {
    eventType: cleanEventType,
    eventTitle: sanitizeText(input.eventTitle)?.slice(0, 150),
    date: input.date,
    startTime: input.startTime && /^\d{1,2}:\d{2}$/.test(input.startTime) ? input.startTime : '18:30',
    durationHours,
    location: cleanLocation,
    venueType: sanitizeText(input.venueType)?.slice(0, 100) || 'Heritage Venue',
    guestCount: guests,
    budget,
    currency,
    vibeAndTheme: sanitizeText(input.vibeAndTheme)?.slice(0, 500) || 'Royal Festive Gathering',
    cuisinePreference: sanitizeText(input.cuisinePreference)?.slice(0, 500) || 'Traditional Feast',
    entertainmentPreference: sanitizeText(input.entertainmentPreference)?.slice(0, 500) || 'Live Music Ensemble',
    specialRequirements: sanitizeText(input.specialRequirements)?.slice(0, 1000) || '',
  };

  return { valid: true, sanitized };
}

// Fallback plan generator for offline/resilience testing or API key absence
export function generateFallbackPlan(input: Partial<EventInput>): EventPlan {
  const currency = input.currency || 'INR';
  const totalBudget = Number(input.budget) || 100000;
  const guestCount = Number(input.guestCount) || 100;
  const costPerGuest = Math.round(totalBudget / (guestCount || 1));
  const eventTitle = input.eventTitle?.trim() || `${input.eventType || 'Celebration'} at ${input.location || 'Destination'}`;

  const budgetItems = [
    { id: 'b-1', category: 'Venue & Staging Infrastructure', allocatedPercent: 28, allocatedAmount: Math.round(totalBudget * 0.28), actualAmount: 0, notes: 'Includes ballroom/garden rental, bridal suites, basic lighting' },
    { id: 'b-2', category: 'Culinary & Beverage Dastarkhwan', allocatedPercent: 32, allocatedAmount: Math.round(totalBudget * 0.32), actualAmount: 0, notes: 'Full course dinner, live counters, welcome drinks, desserts' },
    { id: 'b-3', category: 'Atmosphere, Decor & Floral Architecture', allocatedPercent: 18, allocatedAmount: Math.round(totalBudget * 0.18), actualAmount: 0, notes: 'Marigold & jasmine arrangements, velvet bolsters, candlelit centerpieces' },
    { id: 'b-4', category: 'Acoustics & Live Entertainment', allocatedPercent: 12, allocatedAmount: Math.round(totalBudget * 0.12), actualAmount: 0, notes: 'Sitar/tabla duo, ghazal vocalist, acoustic sound engineer' },
    { id: 'b-5', category: 'Cinematic Photography & Film', allocatedPercent: 6, allocatedAmount: Math.round(totalBudget * 0.06), actualAmount: 0, notes: '2 candid photographers, 1 videographer, drone highlights' },
    { id: 'b-6', category: 'Hospitality & Traditional Favors', allocatedPercent: 4, allocatedAmount: Math.round(totalBudget * 0.04), actualAmount: 0, notes: 'Ittar bar, silk potlis with dry fruits, welcome garlands' },
  ];

  const startTimeStr = input.startTime || '18:30';
  const [startHour, startMin] = startTimeStr.split(':').map(Number);
  const baseMinutes = (isNaN(startHour) ? 18 : startHour) * 60 + (isNaN(startMin) ? 30 : startMin);

  const formatOffset = (offsetMinutes: number) => {
    const totalM = (baseMinutes + offsetMinutes) % (24 * 60);
    const h = Math.floor(totalM / 60);
    const m = totalM % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    input: {
      eventType: input.eventType || 'Cultural Soiree',
      eventTitle,
      date: input.date || '2026-11-20',
      startTime: input.startTime || '18:30',
      durationHours: input.durationHours || 5,
      location: input.location || 'Jaipur',
      venueType: input.venueType || 'Heritage Courtyard',
      guestCount,
      budget: totalBudget,
      currency,
      vibeAndTheme: input.vibeAndTheme || 'Warm Amber, Candlelight & Poetry',
      cuisinePreference: input.cuisinePreference || 'Awadhi & Mughlai Royal Cuisine',
      entertainmentPreference: input.entertainmentPreference || 'Semi-Classical Sitar & Live Ghazals',
      specialRequirements: input.specialRequirements || '',
    },
    summary: {
      title: eventTitle,
      tagline: `An enchanting evening of soulful melodies and timeless hospitality in ${input.location || 'grand style'}`,
      eventOverview: `A bespoke ${input.eventType || 'celebration'} thoughtfully curated for ${guestCount} cherished guests. Set against ${input.venueType || 'a heritage atmosphere'}, this experience blends musical poetry with regal feasts and thoughtful hospitality.`,
      atmosphereNarrative: `Soft amber lanterns cast a golden glow across rich maroon and saffron fabrics. As guests step across the threshold, the fragrant aroma of wild rose and crushed cardamom welcomes them, accompanied by the gentle strum of a sitar in the courtyard.`,
      colorPalette: [
        { name: 'Kesar Gold', hex: '#E5A93C', role: 'Primary ambient lighting and metallic embroidery' },
        { name: 'Gulab Crimson', hex: '#9B1B30', role: 'Velvet bolsters and floral marigold runners' },
        { name: 'Raw Umber', hex: '#3E2723', role: 'Carved wood low-tables and antique brass accents' },
        { name: 'Pista Mist', hex: '#D7E8BA', role: 'Soft organza drapery and table linen base' },
        { name: 'Midnight Jaam', hex: '#2A1B3D', role: 'Evening sky canopy and stage velvet backdrop' },
      ],
      suggestedDressCode: 'Festive Royal Attire: Raw silks, jamdani weaves, sherwanis, or flowing anarkalis in sunset jewel tones.',
      estimatedCostPerGuest: costPerGuest,
    },
    timeline: [
      {
        id: 't-1',
        time: formatOffset(-60),
        title: 'Vendor Sign-In & Acoustic Soundcheck',
        phase: 'Setup & Prep',
        description: 'Sound engineer tests floor microphones for sitar and tabla on acoustic carpets; catering finalizes welcome beverage stations.',
        leadRole: 'Lead Stage Manager',
        cue: 'Mics live; sound levels calibrated to 72dB; brass samovars heated.',
        isCompleted: false,
      },
      {
        id: 't-2',
        time: formatOffset(0),
        title: 'Guest Arrival & Ittar Welcome Ritual',
        phase: 'Arrival & Welcome',
        description: 'Guests are received with distilled rosewater mist, fresh mogra bracelets, and chilled saffron-almond thandai sips.',
        leadRole: 'Hospitality Concierge',
        cue: 'Slow ambient raga begins on sitar; candle lanterns lit throughout deorhi.',
        isCompleted: false,
      },
      {
        id: 't-3',
        time: formatOffset(45),
        title: 'Opening Welcome & Toast',
        phase: 'Ritual & Ceremony',
        description: 'Hosts offer welcoming words of gratitude, lighting the ceremonial brass diya to formally commence the celebration.',
        leadRole: 'Host / Master of Ceremonies',
        cue: 'Lighting fades gently to warm golden wash; spotlight on ceremonial dais.',
        isCompleted: false,
      },
      {
        id: 't-4',
        time: formatOffset(75),
        title: 'Acoustic Baithak & Melodic Ghazals',
        phase: 'Entertainment & Program',
        description: 'Soulful live musical performance featuring soulful poetry, tabla rhythms, and interactive musical requests from elders and guests.',
        leadRole: 'Music Director',
        cue: 'Stage lighting shifts to deep jewel tones; light finger-food passed silently.',
        isCompleted: false,
      },
      {
        id: 't-5',
        time: formatOffset(150),
        title: 'Royal Dastarkhwan Feast Unveiled',
        phase: 'Dining & Feast',
        description: 'Grand dining pavilion opens with signature delicacies, live tandoor and bread stations, aromatic biryanis, and vegetarian royal thalis.',
        leadRole: 'Executive Chef & Banquet Captain',
        cue: 'Soft instrumental background raga; dining chandeliers elevated.',
        isCompleted: false,
      },
      {
        id: 't-6',
        time: formatOffset(240),
        title: 'Sweet Delights, Paan & Parting Mementos',
        phase: 'Wrap & Departure',
        description: 'Warm saffron jalebis, kulfi falooda, and artisanal meetha paan served alongside personalized memento boxes.',
        leadRole: 'Hospitality Lead',
        cue: 'Ambient lighting warms; farewell music plays; guest transport on standby.',
        isCompleted: false,
      },
    ],
    budgetBreakdown: {
      totalBudget,
      currency,
      items: budgetItems,
      contingencyAmount: Math.round(totalBudget * 0.05),
      budgetHealthNotes: 'Balanced allocation favoring food quality and sound acoustics. 5% contingency buffer reserved for last-minute guest overflows.',
      costSavingTips: [
        'Leverage indigenous seasonal blooms (marigold, tuberose) instead of imported lilies to reduce decor costs by 25%.',
        'Focus live music on an intimate 3-piece acoustic ensemble rather than a full amplified band.',
        'Pre-order artisanal signature mocktails in bulk carafes rather than open custom mixology.',
      ],
    },
    vendorChecklist: [
      {
        id: 'v-1',
        category: 'Live Music & Sound',
        name: 'Swar Sadhana Ensemble',
        role: 'Sitar, Tabla & Lead Ghazal Vocalist',
        status: 'Quote Received',
        priority: 'Critical',
        estimatedCost: Math.round(totalBudget * 0.12),
        deliverables: ['3-hour live performance', 'Full acoustic sound system & monitors', 'Floor seating bolster setup'],
        contactNotes: 'Requires 4 low wooden seating platforms and 3 direct DI instrument lines.',
        bookingDeadline: '3 weeks before celebration date',
      },
      {
        id: 'v-2',
        category: 'Catering & Beverages',
        name: 'Dastarkhwan Heritage Caterers',
        role: 'Master Chef & Service Staff',
        status: 'Shortlisted',
        priority: 'Critical',
        estimatedCost: Math.round(totalBudget * 0.32),
        deliverables: ['Welcome beverages & appetizers', '3-course seated/buffet royal dinner', 'Dessert counter & artisanal paan'],
        contactNotes: 'Menu tasting scheduled 14 days prior; verify live tandoor gas permissions with venue.',
        bookingDeadline: '4 weeks before celebration date',
      },
      {
        id: 'v-3',
        category: 'Floral & Decor Styling',
        name: 'Zari & Zauq Design Studio',
        role: 'Scenographer & Floral Artisan',
        status: 'To Inquire',
        priority: 'High',
        estimatedCost: Math.round(totalBudget * 0.18),
        deliverables: ['Welcome entryway archway', 'Low baithak velvet seating bolsters', '30 brass table centerpieces with floating candles'],
        contactNotes: 'Sample swatch review requested for jewel tone velvet runners.',
        bookingDeadline: '3 weeks before celebration date',
      },
      {
        id: 'v-4',
        category: 'Photography & Film',
        name: 'Tasveer Studio Collective',
        role: 'Lead Candid Photographer & Cinematographer',
        status: 'To Inquire',
        priority: 'Medium',
        estimatedCost: Math.round(totalBudget * 0.06),
        deliverables: ['350 high-resolution edited photos', '3-minute celebration cinematic teaser', 'Online private gallery delivered in 10 days'],
        contactNotes: 'Request golden hour outdoor family portraits 45 minutes prior to guest arrival.',
        bookingDeadline: '2 weeks before celebration date',
      },
    ],
    curatedMenu: [
      {
        title: 'Peshkash (Welcome Sips & Canapés)',
        description: 'Chilled arrival refreshments to cleanse the palate and set a leisurely festive cadence.',
        items: [
          { name: 'Kesar Almond Thandai', description: 'Chilled milk infused with hand-crushed almonds, saffron strands, and fragrant fennel', dietary: 'Vegetarian, Gluten-Free' },
          { name: 'Dahi Ke Kebab', description: 'Hung yogurt patties spiced with ginger, green chili, and cardamom, seared to a delicate crisp', dietary: 'Vegetarian' },
          { name: 'Murgh Malai Boti', description: 'Tender chicken morsels marinated in fresh cream, green cardamom, and white pepper', dietary: 'Non-Vegetarian, Halal' },
        ],
      },
      {
        title: 'Dastarkhwan-e-Khaas (The Royal Banquet)',
        description: 'Slow-simmered regional delicacies served alongside artisanal breads and aromatic basmati.',
        items: [
          { name: 'Dum Nalli Biryani', description: 'Aged basmati rice sealed in earthen pots with fragrant whole spices and tender cuts', dietary: 'Non-Vegetarian, Halal' },
          { name: 'Paneer Lababdar', description: 'Charred cottage cheese cubes simmered in a luscious tomato, cashew, and melon seed reduction', dietary: 'Vegetarian, Gluten-Free' },
          { name: 'Dal Bukhara Overnight Simmer', description: 'Black lentils slow-cooked for 18 hours over charcoal with churned butter and roasted cumin', dietary: 'Vegetarian' },
          { name: 'Sheermal & Zafrani Roti', description: 'Saffron-brushed traditional tandoori flatbreads baked fresh', dietary: 'Vegetarian' },
        ],
      },
      {
        title: 'Shireen & Khitaam (Sweet Finales & Digestifs)',
        description: 'Decadent celebratory sweets followed by digestive herbal touches.',
        items: [
          { name: 'Kesari Shahi Tukda', description: 'Crisp ghee-fried bread soaked in cardamom rabri and topped with 24k edible gold leaf and pistachios', dietary: 'Vegetarian' },
          { name: 'Rose Petal Kulfi', description: 'Dense slow-churned clotted cream ice infused with pure Damascus rose essence', dietary: 'Vegetarian, Gluten-Free' },
          { name: 'Banarasi Meetha Paan', description: 'Betel leaves stuffed with rose petal preserve (gulkand), fennel, and aromatic spices', dietary: 'Vegan, Digestif' },
        ],
      },
    ],
    zones: [
      {
        zoneName: 'Deorhi (The Welcome Courtyard)',
        purpose: 'Guest reception, ittar application, and chilled welcome beverage distribution',
        seatingType: 'Standing cocktail high-tables with carved brass samovars',
        capacity: Math.round(guestCount * 0.4),
        ambianceDetails: 'Flickering brass lanterns, rose petals scattered on marble steps, warm sandalwood aroma.',
      },
      {
        zoneName: 'Mehfil Baithak (The Central Performance Sanctuary)',
        purpose: 'Live acoustic musical concert, toasts, and shared cultural storytelling',
        seatingType: 'Low floor mattresses with velvet gaddi bolsters, Persian carpets, and low brass tables',
        capacity: guestCount,
        ambianceDetails: 'Overhead raw silk draping in deep maroon and amber, warm 2700K fairy lights, acoustically balanced carpeting.',
      },
      {
        zoneName: 'Bagh Dastarkhwan (The Dining Pavilion)',
        purpose: 'Grand banquet dinner, live cooking counters, and lingering conversation',
        seatingType: 'Round 8-seater dining tables with floor-length raw silk tablecloths',
        capacity: Math.round(guestCount * 0.75),
        ambianceDetails: 'Crystal chandeliers suspended from banyan trees, soft candlelight, unobtrusive raga background music.',
      },
    ],
    coPilotNotes: [
      'Ensure the sound engineer does a sound check with the lead vocalist specifically on the acoustic carpets.',
      'Have an emergency tea & water station ready near the performance dais for the performers.',
    ],
  };
}

// Generate celebration plan via Gemini or resilient fallback
export async function handleGeneratePlan(rawBody: any): Promise<{
  success: boolean;
  status?: number;
  error?: string;
  data?: EventPlan;
}> {
  const validation = validateEventInput(rawBody);
  if (!validation.valid || !validation.sanitized) {
    return { success: false, status: 400, error: validation.error };
  }
  const input: EventInput = validation.sanitized;

  // If Gemini API key is absent, use the curated structured fallback plan
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured. Returning rich curated fallback plan.');
    return { success: true, data: generateFallbackPlan(input) };
  }

  const systemPrompt = `You are "Mehfil AI", a world-class luxury celebration designer and cultural event planner.
Your goal is to produce a bespoke, realistic, detailed event blueprint for:
- Event: ${input.eventType} (${input.eventTitle || 'Celebration'})
- Date: ${input.date}, Start: ${input.startTime || '18:00'}, Duration: ${input.durationHours || 5} hours
- Location: ${input.location}, Venue Type: ${input.venueType}
- Guests: ${input.guestCount}
- Budget: ${input.currency} ${input.budget}
- Desired Vibe/Theme: ${input.vibeAndTheme}
- Cuisine Preferences: ${input.cuisinePreference}
- Entertainment/Music: ${input.entertainmentPreference}
- Special Notes: ${input.specialRequirements || 'None'}

Generate a complete JSON object matching this structure:
{
  "summary": {
    "title": string,
    "tagline": string,
    "eventOverview": string,
    "atmosphereNarrative": string,
    "colorPalette": [ { "name": string, "hex": string, "role": string } ], // 5 distinct harmonious colors
    "suggestedDressCode": string,
    "estimatedCostPerGuest": number
  },
  "timeline": [
    {
      "time": string (e.g. "17:00", "18:30"),
      "title": string,
      "phase": "Setup & Prep" | "Arrival & Welcome" | "Ritual & Ceremony" | "Entertainment & Program" | "Dining & Feast" | "Celebration & Dance" | "Wrap & Departure",
      "description": string,
      "leadRole": string,
      "cue": string
    }
  ],
  "budgetBreakdown": {
    "items": [
      {
        "category": string,
        "allocatedPercent": number,
        "allocatedAmount": number,
        "actualAmount": 0,
        "notes": string
      }
    ],
    "contingencyAmount": number,
    "budgetHealthNotes": string,
    "costSavingTips": string[]
  },
  "vendorChecklist": [
    {
      "category": string,
      "name": string,
      "role": string,
      "status": "To Inquire" | "Shortlisted" | "Quote Received" | "Contract Signed" | "Deposit Paid",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "estimatedCost": number,
      "deliverables": string[],
      "contactNotes": string,
      "bookingDeadline": string
    }
  ],
  "curatedMenu": [
    {
      "title": string,
      "description": string,
      "items": [
        { "name": string, "description": string, "dietary": string }
      ]
    }
  ],
  "zones": [
    {
      "zoneName": string,
      "purpose": string,
      "seatingType": string,
      "capacity": number,
      "ambianceDetails": string
    }
  ],
  "coPilotNotes": string[]
}

Ensure all budget category allocatedPercent values sum to 100%.
Ensure the amounts reflect the total budget of ${input.currency} ${input.budget}.
Ensure the timeline covers the duration from ${input.startTime || '18:00'} until the end.
Provide vivid, authentic, poetic yet highly actionable details! Output ONLY valid JSON.`;

  try {
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out after 40s')), 40000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const rawText = response.text?.trim() || '';
    if (!rawText) {
      throw new Error('Empty response from AI model.');
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI output as JSON.');
      }
    }

    // Enrich with IDs and ensure safe fallbacks
    const planId = `plan-${Date.now()}`;
    const totalBudget = Number(input.budget) || 100000;
    const guestCount = Number(input.guestCount) || 100;

    const timeline: any[] = (parsedData.timeline || []).map((t: any, i: number) => ({
      id: `t-${i + 1}`,
      time: t.time || '18:00',
      title: t.title || `Milestone ${i + 1}`,
      phase: t.phase || 'Entertainment & Program',
      description: t.description || '',
      leadRole: t.leadRole || 'Coordinator',
      cue: t.cue || '',
      isCompleted: false,
    }));

    const budgetItems: any[] = (parsedData.budgetBreakdown?.items || []).map((b: any, i: number) => ({
      id: `b-${i + 1}`,
      category: b.category || `Category ${i + 1}`,
      allocatedPercent: Number(b.allocatedPercent) || 10,
      allocatedAmount: Number(b.allocatedAmount) || Math.round((Number(b.allocatedPercent || 10) / 100) * totalBudget),
      actualAmount: 0,
      notes: b.notes || 'Allocated budget category',
    }));

    const vendorChecklist: any[] = (parsedData.vendorChecklist || []).map((v: any, i: number) => ({
      id: `v-${i + 1}`,
      category: v.category || 'Event Partner',
      name: v.name || `Specialist ${i + 1}`,
      role: v.role || 'Service Partner',
      status: v.status || 'To Inquire',
      priority: v.priority || 'Medium',
      estimatedCost: Number(v.estimatedCost) || Math.round(totalBudget * 0.1),
      deliverables: Array.isArray(v.deliverables) && v.deliverables.length > 0
        ? v.deliverables
        : ['Provide comprehensive service on schedule', 'Maintain direct communication with host'],
      contactNotes: v.contactNotes || 'Contact via planner inquiry',
      bookingDeadline: v.bookingDeadline || '2 weeks before event',
    }));

    const costPerGuest = Math.round(totalBudget / (guestCount || 1));

    const completePlan: EventPlan = {
      id: planId,
      generatedAt: new Date().toISOString(),
      input,
      summary: {
        title: parsedData.summary?.title || `${input.eventType} in ${input.location}`,
        tagline: parsedData.summary?.tagline || 'An extraordinary celebration designed to inspire',
        eventOverview: parsedData.summary?.eventOverview || `A gathering of ${guestCount} guests in ${input.location}.`,
        atmosphereNarrative: parsedData.summary?.atmosphereNarrative || 'Curated with warmth, elegance, and sensory beauty.',
        colorPalette: parsedData.summary?.colorPalette || generateFallbackPlan(input).summary.colorPalette,
        suggestedDressCode: parsedData.summary?.suggestedDressCode || 'Festive Indian Formal',
        estimatedCostPerGuest: costPerGuest,
      },
      timeline: timeline.length > 0 ? timeline : generateFallbackPlan(input).timeline,
      budgetBreakdown: {
        totalBudget,
        currency: input.currency || 'INR',
        items: budgetItems.length > 0 ? budgetItems : generateFallbackPlan(input).budgetBreakdown.items,
        contingencyAmount: Number(parsedData.budgetBreakdown?.contingencyAmount) || Math.round(totalBudget * 0.05),
        budgetHealthNotes: parsedData.budgetBreakdown?.budgetHealthNotes || 'Budget allocations balanced across key sensory dimensions.',
        costSavingTips: parsedData.budgetBreakdown?.costSavingTips || [
          'Order seasonal indigenous blooms',
          'Optimize beverage stations with 2 signature mocktails/cocktails',
        ],
      },
      vendorChecklist: vendorChecklist.length > 0 ? vendorChecklist : generateFallbackPlan(input).vendorChecklist,
      curatedMenu: parsedData.curatedMenu || generateFallbackPlan(input).curatedMenu,
      zones: parsedData.zones || generateFallbackPlan(input).zones,
      coPilotNotes: parsedData.coPilotNotes || [
        'Review audio line-checks before guest arrival.',
        'Assign a dedicated coordinator for greeting VIP elders.',
      ],
    };

    return { success: true, data: completePlan };
  } catch (error: any) {
    console.warn('Gemini generation failed or timed out. Serving resilient fallback plan:', error?.message);
    const fallback = generateFallbackPlan(input);
    return { success: true, data: fallback };
  }
}

// Generate suggestion advice
export async function handleAiSuggest(body: SuggestionRequest): Promise<{
  success: boolean;
  status?: number;
  error?: string;
  advice?: string;
}> {
  const { plan, prompt, category } = body;
  if (!prompt || typeof prompt !== 'string') {
    return { success: false, status: 400, error: 'Prompt is required for suggestion.' };
  }

  const cleanPrompt = sanitizeText(prompt).slice(0, 1000);
  if (!cleanPrompt) {
    return { success: false, status: 400, error: 'A valid text prompt is required for suggestion.' };
  }

  if (!apiKey) {
    return {
      success: true,
      advice: `Based on your celebration plan for "${plan?.summary?.title || 'Event'}", here is a practical recommendation: "${cleanPrompt}". Make sure your key stakeholders and vendors sign off on any schedule changes at least 48 hours prior.`,
    };
  }

  const queryPrompt = `You are Mehfil AI, the senior event consultant for this celebration:
- Event: "${plan?.summary?.title || 'Celebration'}"
- Location: ${plan?.input?.location || 'Destination'}
- Guests: ${plan?.input?.guestCount || 100}
- Total Budget: ${plan?.budgetBreakdown?.currency || 'INR'} ${plan?.budgetBreakdown?.totalBudget || 500000}
${category ? `- Focus Category: ${category}` : ''}

The organizer asks:
"${cleanPrompt}"

Provide a concise, practical, expert recommendation (2-3 paragraphs) tailored specifically to this event. If helpful, provide bullet points of actionable next steps. Be warm, professional, and culturally perceptive.`;

  try {
    const suggestPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: queryPrompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Suggestion request timed out')), 30000)
    );

    const response = await Promise.race([suggestPromise, timeoutPromise]);
    const advice = response.text?.trim() || 'No advice generated.';
    return { success: true, advice };
  } catch (error: any) {
    console.warn('AI suggestion fallback used:', error?.message);
    return {
      success: true,
      advice: `Strategic celebration recommendation for "${plan?.summary?.title || 'your event'}":

1. Sensory Hospitality: Greet arriving guests with chilled signature drinks (e.g., Saffron Almond Thandai or Rose Hibiscus Spritz) and fresh floral accents.
2. Run of Show Pacing: Preserve an uninterrupted 45-minute window for the headline musical performance or toasts before opening dining stations.
3. Vendor Coordination: Conduct a complete soundcheck 90 minutes before doors open to calibrate acoustic balance on carpets and seating bolsters.`,
    };
  }
}

// Health status check
export function checkHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!apiKey,
  };
}
