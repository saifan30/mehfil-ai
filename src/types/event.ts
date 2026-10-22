export interface EventInput {
  eventType: string;
  customEventType?: string;
  eventTitle?: string;
  date: string;
  startTime: string;
  durationHours: number;
  location: string;
  venueType: string;
  guestCount: number;
  budget: number;
  currency: 'INR' | 'USD' | 'GBP' | 'AED' | 'EUR' | 'CAD';
  vibeAndTheme: string;
  cuisinePreference: string;
  entertainmentPreference: string;
  specialRequirements?: string;
}

export type TimelinePhase = 
  | 'Setup & Prep'
  | 'Arrival & Welcome'
  | 'Ritual & Ceremony'
  | 'Entertainment & Program'
  | 'Dining & Feast'
  | 'Celebration & Dance'
  | 'Wrap & Departure';

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  phase: TimelinePhase;
  description: string;
  leadRole: string;
  cue: string;
  isCompleted?: boolean;
}

export interface BudgetItem {
  id: string;
  category: string;
  allocatedPercent: number;
  allocatedAmount: number;
  actualAmount: number;
  notes: string;
}

export type VendorStatus = 
  | 'To Inquire'
  | 'Shortlisted'
  | 'Quote Received'
  | 'Contract Signed'
  | 'Deposit Paid'
  | 'Fully Paid';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface VendorItem {
  id: string;
  category: string;
  name: string;
  role: string;
  status: VendorStatus;
  priority: PriorityLevel;
  estimatedCost: number;
  deliverables: string[];
  contactNotes: string;
  bookingDeadline: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
  role: string;
}

export interface MenuItem {
  name: string;
  description: string;
  dietary: string; // e.g. "Vegetarian", "Vegan", "Halal", "Contains Nuts", "Gluten-Free"
}

export interface MenuSection {
  title: string;
  description: string;
  items: MenuItem[];
}

export interface ZoneLayout {
  zoneName: string;
  purpose: string;
  seatingType: string;
  capacity: number;
  ambianceDetails: string;
}

export interface EventPlan {
  id: string;
  generatedAt: string;
  summary: {
    title: string;
    tagline: string;
    eventOverview: string;
    atmosphereNarrative: string;
    colorPalette: PaletteColor[];
    suggestedDressCode: string;
    estimatedCostPerGuest: number;
  };
  input: EventInput;
  timeline: TimelineItem[];
  budgetBreakdown: {
    totalBudget: number;
    currency: string;
    items: BudgetItem[];
    contingencyAmount: number;
    budgetHealthNotes: string;
    costSavingTips: string[];
  };
  vendorChecklist: VendorItem[];
  curatedMenu: MenuSection[];
  zones: ZoneLayout[];
  coPilotNotes: string[];
}

export interface SuggestionRequest {
  plan: EventPlan;
  prompt: string;
  category?: 'budget' | 'timeline' | 'vendors' | 'menu' | 'general';
}

export interface SuggestionResponse {
  advice: string;
  actionableChanges?: {
    timelineUpdates?: Partial<TimelineItem>[];
    budgetAdjustments?: { category: string; suggestedPercent: number; rationale: string }[];
    vendorRecommendations?: Partial<VendorItem>[];
  };
}
