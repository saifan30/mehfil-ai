import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { EventInput, EventPlan, SuggestionRequest } from './src/types/event';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function getCliArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return undefined;
}

const cliPort = getCliArg('--port') || getCliArg('-p');
const PORT = Number(process.env.PORT || cliPort || 3000);
const cliHost = getCliArg('--host') || getCliArg('-h');
const HOST = process.env.HOST || cliHost || '0.0.0.0';

app.use(express.json({ limit: '5mb' }));

// Server-side Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Simple in-memory rate limiter (sliding window)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;

function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequestCounts.get(clientIp);

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
  } else if (record.count < MAX_REQUESTS_PER_WINDOW) {
    record.count++;
    next();
  } else {
    res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }
}

app.use('/api', rateLimitMiddleware);

// Helper to strip dangerous HTML / script tags
function sanitizeText(str?: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

const ALLOWED_CURRENCIES = new Set(['INR', 'USD', 'GBP', 'AED', 'EUR', 'CAD']);

// Input sanitization & validation helper
function validateEventInput(input: Partial<EventInput>): { valid: boolean; error?: string; sanitized?: EventInput } {
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
function generateFallbackPlan(input: EventInput): EventPlan {
  const currency = input.currency || 'INR';
  const totalBudget = Number(input.budget) || 100000;
  const guestCount = Number(input.guestCount) || 100;
  const costPerGuest = Math.round(totalBudget / (guestCount || 1));
  const eventTitle = input.eventTitle?.trim() || `${input.eventType} at ${input.location}`;

  const budgetItems = [
    { id: 'b-1', category: 'Venue & Staging Infrastructure', allocatedPercent: 28, allocatedAmount: Math.round(totalBudget * 0.28), actualAmount: 0, notes: 'Includes ballroom/garden rental, bridal suites, basic lighting' },
    { id: 'b-2', category: 'Catering, Beverages & Live Food Counters', allocatedPercent: 32, allocatedAmount: Math.round(totalBudget * 0.32), actualAmount: 0, notes: 'Welcome drinks, live appetizers, main royal buffet, desserts' },
    { id: 'b-3', category: 'Decor, Floral Art & Ambience Styling', allocatedPercent: 16, allocatedAmount: Math.round(totalBudget * 0.16), actualAmount: 0, notes: 'Entrance arch, baithak cushions, centerpieces, ambient uplighting' },
    { id: 'b-4', category: 'Music, Sound (AV) & Artists', allocatedPercent: 10, allocatedAmount: Math.round(totalBudget * 0.10), actualAmount: 0, notes: 'Live vocalists/musicians, line-array audio system, acoustic mics' },
    { id: 'b-5', category: 'Photography & Cinematic Video', allocatedPercent: 7, allocatedAmount: Math.round(totalBudget * 0.07), actualAmount: 0, notes: 'Traditional & candid coverage, teaser reel, high-res gallery' },
    { id: 'b-6', category: 'Invitations, Favors & Hospitality Gifts', allocatedPercent: 3, allocatedAmount: Math.round(totalBudget * 0.03), actualAmount: 0, notes: 'Custom stationery, luxury scented ittar vials / sweet boxes' },
    { id: 'b-7', category: 'Contingency & Incidentals Fund', allocatedPercent: 4, allocatedAmount: Math.round(totalBudget * 0.04), actualAmount: 0, notes: 'Buffer for weather shifts, overtime power backup, rush items' },
  ];

  const startTime = input.startTime || '18:30';
  const [startH, startM] = startTime.split(':').map(Number);
  const formatHour = (offsetH: number, offsetM: number = 0) => {
    const totalMinutes = (startH * 60 + startM + offsetH * 60 + offsetM) % (24 * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const timeline = [
    {
      id: 't-1',
      time: formatHour(-2, 0),
      title: 'Vendor Load-in & Technical Acoustic Check',
      phase: 'Setup & Prep' as const,
      description: 'Stage setup, sound engineer soundcheck, floral decor inspection and temperature regulation.',
      leadRole: 'Lead Event Director',
      cue: 'Sound board ready; soft ambient sitar testing at low volume.',
    },
    {
      id: 't-2',
      time: formatHour(0, 0),
      title: 'Royal Rosewater Welcome & Signature Sips',
      phase: 'Arrival & Welcome' as const,
      description: 'Guests arrive to fragrant ittar application, jasmine gajras, and chilled signature cardamom coolers.',
      leadRole: 'Hospitality Host & Ushers',
      cue: 'Welcome music swells; warm amber lighting illuminated at entryway.',
    },
    {
      id: 't-3',
      time: formatHour(0, 45),
      title: 'Opening Ceremony & Soulful Acoustic Set',
      phase: 'Entertainment & Program' as const,
      description: 'Host welcomes the gathered guests. Opening musical prelude begins as guests settle into comfortable baithak seating.',
      leadRole: 'Emcee & Ensemble Maestro',
      cue: 'House lights dim by 30%; warm spotlight on performance dais.',
    },
    {
      id: 't-4',
      time: formatHour(1, 45),
      title: 'Celebration Toasts & Keynote Moments',
      phase: 'Ritual & Ceremony' as const,
      description: 'Heartfelt speeches, milestone tributes, and ceremonial felicitation with family and dignitaries.',
      leadRole: 'Family Representative / Emcee',
      cue: 'Wireless lapel microphones primed; background score softens to gentle hum.',
    },
    {
      id: 't-5',
      time: formatHour(2, 30),
      title: 'Grand Royal Feast & Live Culinary Stations',
      phase: 'Dining & Feast' as const,
      description: 'Buffet and live dining stations opened. Chefs carve freshly roasted delights and serve steaming artisanal breads.',
      leadRole: 'Executive Banquet Chef',
      cue: 'Upbeat classical fusion playlist; buffet chandeliers illuminated.',
    },
    {
      id: 't-6',
      time: formatHour(3, 45),
      title: 'High-Energy Musical Crescendo & Joyful Dancing',
      phase: 'Celebration & Dance' as const,
      description: 'The mehfil transitions into an ecstatic collective celebration with rhythmic percussion, clapping, and open dance floor.',
      leadRole: 'Music Director & DJ',
      cue: 'Dynamic color sweeps; bass frequency raised for celebration.',
    },
    {
      id: 't-7',
      time: formatHour(4, 30),
      title: 'Midnight Kashmiri Kahwa & Sweet Farewell',
      phase: 'Wrap & Departure' as const,
      description: 'Warm saffron kahwa and artisan betel leaf paan served to departing guests with bespoke keepsake boxes.',
      leadRole: 'Hospitality Captain',
      cue: 'Lush golden glow; soft instrumental outro.',
    },
  ];

  const vendorChecklist = [
    {
      id: 'v-1',
      category: 'Venue & Staging',
      name: 'Heritage Venue Management',
      role: 'Space and primary facilities manager',
      status: 'Shortlisted' as const,
      priority: 'Critical' as const,
      estimatedCost: Math.round(totalBudget * 0.28),
      deliverables: ['Event hall / courtyard access for 10 hours', 'Air-conditioning & green rooms', 'Valet parking permit'],
      contactNotes: 'Verify load-in timings and noise curfew regulations with venue manager.',
      bookingDeadline: '6-8 weeks prior',
    },
    {
      id: 'v-2',
      category: 'Catering',
      name: 'Shahi Dastarkhwan Caterers',
      role: 'Master Chef & Service Staff',
      status: 'Quote Received' as const,
      priority: 'Critical' as const,
      estimatedCost: Math.round(totalBudget * 0.32),
      deliverables: ['Full multi-course service', 'Live tawa and kebab station', 'Uniformed butler service (1:12 guest ratio)'],
      contactNotes: 'Menu tasting scheduled 3 weeks ahead. Confirm dietary labels.',
      bookingDeadline: '4-6 weeks prior',
    },
    {
      id: 'v-3',
      category: 'Sound & Audio-Visual',
      name: 'Acoustic Harmonics AV',
      role: 'Sound Engineer & Acoustic Specialist',
      status: 'To Inquire' as const,
      priority: 'High' as const,
      estimatedCost: Math.round(totalBudget * 0.10),
      deliverables: ['High-fidelity line-array speakers', '4 Shure wireless vocal mics', 'Stage monitor wedges & mixer'],
      contactNotes: 'Mandatory soundcheck at 16:30. Avoid harsh echo in banquet space.',
      bookingDeadline: '3 weeks prior',
    },
    {
      id: 'v-4',
      category: 'Decor & Florals',
      name: 'Gulmohar Botanical Scenography',
      role: 'Floral Artisan & Spatial Designer',
      status: 'Shortlisted' as const,
      priority: 'High' as const,
      estimatedCost: Math.round(totalBudget * 0.16),
      deliverables: ['Entrance marigold & rose archway', 'Low velvet baithak seating bolsters', 'Brass brassier oil lamps & candles'],
      contactNotes: 'Deliver fresh tuberose and mogra garlands 2 hours before guest arrival.',
      bookingDeadline: '3 weeks prior',
    },
    {
      id: 'v-5',
      category: 'Photography & Cinema',
      name: 'Tasveer Studio Collective',
      role: 'Lead Visual Storyteller',
      status: 'To Inquire' as const,
      priority: 'Medium' as const,
      estimatedCost: Math.round(totalBudget * 0.07),
      deliverables: ['2 candid photographers + 1 cinematic videographer', 'Full high-res edited album', '60-second teaser reel within 48h'],
      contactNotes: 'Provide shot list of VIP family elders and musical solos.',
      bookingDeadline: '4 weeks prior',
    },
  ];

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    summary: {
      title: eventTitle,
      tagline: `An unforgettable ${input.vibeAndTheme || 'celebration'} bringing hearts together in ${input.location}`,
      eventOverview: `Designed for ${guestCount} cherished guests at a ${input.venueType} in ${input.location}. Balanced across music, gastronomy, and gracious hospitality.`,
      atmosphereNarrative: `The atmosphere evokes a timeless mehfil—where warm candlelight dances against rich fabrics, the scent of crushed jasmine and rosewater greets every arrival, and captivating melodies elevate conversation into celebratory joy.`,
      colorPalette: [
        { name: 'Royal Crimson', hex: '#8B1E3F', role: 'Dominant Textile Base' },
        { name: 'Warm Amber Gold', hex: '#D97706', role: 'Lustrous Brass & Lantern Glow' },
        { name: 'Emerald Velvet', hex: '#0F5132', role: 'Botanical & Cushion Depth' },
        { name: 'Ivory Raw Silk', hex: '#FDFBF7', role: 'Draped Canopy & Table Linens' },
        { name: 'Midnight Ochre', hex: '#261C14', role: 'Rich Architectural Contrast' },
      ],
      suggestedDressCode: 'Festive Royal / Elegant Cultural Attire with touches of jewel tones and gold embroidery.',
      estimatedCostPerGuest: costPerGuest,
    },
    input,
    timeline,
    budgetBreakdown: {
      totalBudget,
      currency,
      items: budgetItems,
      contingencyAmount: Math.round(totalBudget * 0.04),
      budgetHealthNotes: 'Balanced allocation with adequate contingency reserve. Catering and venue are properly weighted for guest comfort.',
      costSavingTips: [
        'Utilize seasonal locally sourced flowers (marigold and jasmine) instead of imported blooms to save up to 25% on floral decor.',
        'Opt for a signature mocktail/cocktail duo rather than a fully stocked open bar to streamline beverage expenditure.',
        'Negotiate complimentary green rooms and early morning setup access when locking in the venue contract.',
      ],
    },
    vendorChecklist,
    curatedMenu: [
      {
        title: 'Welcome Elixirs & Refreshers',
        description: 'Chilled upon arrival in silver-trimmed glassware',
        items: [
          { name: 'Saffron Badam Thandai', description: 'Rich stone-ground almond milk infused with Kashmiri saffron and crushed pistachios', dietary: 'Vegetarian, Contains Nuts' },
          { name: 'Gulab Jamun Hibiscus Fizz', description: 'Sparkling mineral water with damask rose reduction, lime, and crushed mint', dietary: 'Vegan, Refreshing' },
        ],
      },
      {
        title: 'Passed Canapés & Live Tawa',
        description: 'Circulated continuously during opening reception',
        items: [
          { name: 'Melt-in-Mouth Galouti Kebabs', description: 'Smoked spice-scented patties on mini saffron sheermal crisps', dietary: 'Halal / Gourmet Meat' },
          { name: 'Nadru & Beetroot Croquettes', description: 'Crisp lotus stem and roasted beet medallions with pomegranate chutney', dietary: 'Vegan, Gluten-Free option' },
          { name: 'Artisan Dahi Puri Cloud Cups', description: 'Delicate semolina spheres with sweetened whipped yogurt and date coulis', dietary: 'Vegetarian' },
        ],
      },
      {
        title: 'Main Royal Dastarkhwan',
        description: 'A sumptuous multi-course seated or buffet feast',
        items: [
          { name: 'Awadhi Dum Biryani', description: 'Aged basmati rice sealed with fragrant whole spices, brown shallots, and saffron steam', dietary: 'Chef Specialty' },
          { name: 'Paneer Lababdar & Dal Bukhara', description: 'Slow-simmered black lentils cooked overnight on charcoal embers with churned butter', dietary: 'Vegetarian' },
          { name: 'Fresh Taftan & Roghani Naan', description: 'Tandoor-baked breads brushed with nigella seeds and melted ghee', dietary: 'Freshly Baked' },
        ],
      },
      {
        title: 'Sweet Epilogue',
        description: 'Artisanal confections served with digestif tea',
        items: [
          { name: 'Shahi Tukda Tartlets', description: 'Crispy brioche soaked in rabri cream, topped with silver leaf and candied almonds', dietary: 'Vegetarian' },
          { name: 'Peshawari Kahwa & Paan', description: 'Green tea brewed with cinnamon, cardamom, and saffron served alongside sweet meetha paan', dietary: 'Digestif' },
        ],
      },
    ],
    zones: [
      {
        zoneName: 'The Deorhi (Welcome Portico)',
        purpose: 'Guest reception, fragrance gifting, and coats/registry',
        seatingType: 'Standing with velvet bench seating',
        capacity: Math.min(guestCount, 40),
        ambianceDetails: 'Scent of ittar, brass urli with floating marigolds and scented candles.',
      },
      {
        zoneName: 'The Mehfil Baithak (Central Performance Lounge)',
        purpose: 'Live acoustic music, storytelling, and key ceremony viewing',
        seatingType: 'Tiered low gaddi seating with Persian rugs, bolster cushions, and cocktail tables',
        capacity: Math.round(guestCount * 0.7),
        ambianceDetails: 'Acoustically tuned, soft amber overhead chandeliers, zero glare on artists.',
      },
      {
        zoneName: 'The Dastarkhwan (Dining Pavilion)',
        purpose: 'Comfortable dinner service with easy circulation',
        seatingType: 'Banquet tables draped in raw ivory silk with floral centerpieces',
        capacity: guestCount,
        ambianceDetails: 'Warm glow, soft background music, wide aisles for seamless service flow.',
      },
    ],
    coPilotNotes: [
      'Ensure the sound engineer does a sound check with the lead vocalist specifically on the acoustic carpets.',
      'Have an emergency tea & water station ready near the performance dais for the performers.',
    ],
  };
}

// API: Generate Event Plan
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  let input: EventInput | undefined;
  try {
    const validation = validateEventInput(req.body);
    if (!validation.valid || !validation.sanitized) {
      res.status(400).json({ error: validation.error });
      return;
    }
    input = validation.sanitized;

    // Check if Gemini API is available
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. Returning rich curated fallback plan.');
      const fallback = generateFallbackPlan(input);
      res.json(fallback);
      return;
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
    } catch (parseError) {
      console.warn('Direct JSON parse failed, attempting regex extraction:', parseError);
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
      allocatedAmount: Number(b.allocatedAmount) || Math.round(totalBudget * 0.1),
      actualAmount: 0,
      notes: b.notes || '',
    }));

    const vendorChecklist: any[] = (parsedData.vendorChecklist || []).map((v: any, i: number) => ({
      id: `v-${i + 1}`,
      category: v.category || 'Vendor',
      name: v.name || `Partner ${i + 1}`,
      role: v.role || 'Service Specialist',
      status: v.status || 'To Inquire',
      priority: v.priority || 'Medium',
      estimatedCost: Number(v.estimatedCost) || 0,
      deliverables: Array.isArray(v.deliverables) ? v.deliverables : [v.deliverables || 'Service provision'],
      contactNotes: v.contactNotes || '',
      bookingDeadline: v.bookingDeadline || '3 weeks prior',
    }));

    const completePlan: EventPlan = {
      id: planId,
      generatedAt: new Date().toISOString(),
      summary: {
        title: parsedData.summary?.title || input.eventTitle || `${input.eventType} in ${input.location}`,
        tagline: parsedData.summary?.tagline || `A memorable celebration curated with warmth`,
        eventOverview: parsedData.summary?.eventOverview || `Curated for ${guestCount} guests in ${input.location}.`,
        atmosphereNarrative: parsedData.summary?.atmosphereNarrative || 'A warm, joyous gathering of family and friends.',
        colorPalette: parsedData.summary?.colorPalette || [
          { name: 'Warm Amber', hex: '#D97706', role: 'Primary' },
          { name: 'Deep Burgundy', hex: '#881337', role: 'Accent' },
          { name: 'Ivory Cream', hex: '#FDFBF7', role: 'Neutral' },
        ],
        suggestedDressCode: parsedData.summary?.suggestedDressCode || 'Celebratory Festive Elegance',
        estimatedCostPerGuest: parsedData.summary?.estimatedCostPerGuest || Math.round(totalBudget / guestCount),
      },
      input,
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

    res.json(completePlan);
  } catch (error: any) {
    console.error('Error generating event plan:', error);
    // If Gemini fails or times out, provide the resilient fallback so the user is never left hanging
    try {
      const fallback = generateFallbackPlan(input || req.body);
      res.json(fallback);
    } catch {
      res.status(500).json({
        error: 'Failed to generate event plan. Please check inputs and retry.',
        details: error?.message,
      });
    }
  }
});

// API: AI Suggestions / Co-Pilot Query
app.post('/api/ai-suggest', async (req: Request, res: Response) => {
  try {
    const { plan, prompt, category }: SuggestionRequest = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required for suggestion.' });
      return;
    }

    if (!apiKey) {
      res.json({
        advice: `Based on your celebration plan for "${plan?.summary?.title || 'Event'}", here is a practical recommendation: "${prompt}". Make sure your key stakeholders and vendors sign off on any schedule changes at least 48 hours prior.`,
      });
      return;
    }

    const queryPrompt = `You are Mehfil AI, the senior event consultant for this celebration:
Event Title: ${plan.summary?.title}
Location: ${plan.input?.location}
Guests: ${plan.input?.guestCount}
Budget: ${plan.budgetBreakdown?.currency} ${plan.budgetBreakdown?.totalBudget}
User Request / Question: "${prompt}"
Context Focus: ${category || 'general'}

Provide a concise, practical, expert recommendation (2-3 paragraphs) tailored specifically to this event. If helpful, provide bullet points of actionable next steps. Be warm, professional, and culturally perceptive.`;

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
    res.json({ advice });
  } catch (error: any) {
    console.warn('AI suggestion fallback used:', error?.message);
    res.json({
      advice: `Strategic celebration recommendation for "${req.body?.plan?.summary?.title || 'your event'}":

1. Sensory Hospitality: Greet arriving guests with chilled signature drinks (e.g., Saffron Almond Thandai or Rose Hibiscus Spritz) and fresh floral accents.
2. Run of Show Pacing: Preserve an uninterrupted 45-minute window for the headline musical performance or toasts before opening dining stations.
3. Vendor Coordination: Conduct a complete soundcheck 90 minutes before doors open to calibrate acoustic balance on carpets and seating bolsters.`,
    });
  }
});

// API: Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!apiKey,
  });
});

// Dev vs Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Mehfil AI server is running on http://${HOST}:${PORT}`);
  });
}

startServer();
