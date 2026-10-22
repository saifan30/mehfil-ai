import { EventInput } from '../types/event';

export interface SampleScenario {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  data: EventInput;
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'sangeet-mehfil',
    badge: 'Royal Sangeet',
    title: 'Grand Royal Sangeet & Musical Mehfil',
    tagline: 'Palatial celebration with live Qawwali, Sufi melodies, and Awadhi culinary banquet',
    data: {
      eventType: 'Wedding / Sangeet & Reception',
      eventTitle: 'Anaya & Kabir’s Sangeet & Mehfil-e-Khaas',
      date: '2026-11-28',
      startTime: '18:30',
      durationHours: 6,
      location: 'Udaipur, Rajasthan',
      venueType: 'Heritage Haveli / Lakeside Palace Courtyard',
      guestCount: 280,
      budget: 3500000,
      currency: 'INR',
      vibeAndTheme: 'Royal Rajasthani Heritage meets Sufi Mysticism, velvet drapery, brass lanterns, mogra garlands',
      cuisinePreference: 'Awadhi Dum Cooking, Live Galouti Kebab Station, Dal Bukhara, Saffron Pulao, Artisan Mithai Bar',
      entertainmentPreference: 'Live Classical Sarangi & Sitar welcome, Nizami Brothers Sufi Qawwali troupe, followed by celebratory DJ set',
      specialRequirements: 'Spacious low baithak with silk bolsters near the stage for family elders, and non-alcoholic Kashmiri Kahwa bar for late evening.',
    },
  },
  {
    id: 'ghazal-night',
    badge: 'Intimate Ghazal',
    title: 'Velvet Midnight Ghazal & Poetry Soiree',
    tagline: 'Warm candlelit gathering with acoustic harmonium, ghazal recitals, and artisanal cocktails',
    data: {
      eventType: 'Ghazal & Musical Mehfil',
      eventTitle: 'Jashn-e-Sukhan: An Evening of Ghazals & Verse',
      date: '2026-12-12',
      startTime: '19:00',
      durationHours: 5,
      location: 'London, Mayfair',
      venueType: 'Private Rooftop Conservatory / Boutique Atrium',
      guestCount: 65,
      budget: 14000,
      currency: 'GBP',
      vibeAndTheme: 'Midnight velvet, brushed brass, warm amber candlelight, acoustic Persian rugs, intimate baithak',
      cuisinePreference: 'Modern progressive Indian tapas, Truffle Kulchas, Smoked Lamb Chops, Saffron Crème Brûlée',
      entertainmentPreference: 'Renowned Ghazal duo with live harmonium, acoustic tabla, and guest open-mic sher-o-shayari',
      specialRequirements: 'Strict acoustic focus: sound dampening drapery, no competing bar noise during recital sets.',
    },
  },
  {
    id: 'milestone-birthday',
    badge: 'Golden Jubilee',
    title: '50th Milestone Golden Jubilee Celebration',
    tagline: 'Glamorous yet heartfelt family gathering celebrating five decades of life and friendship',
    data: {
      eventType: 'Milestone Birthday (50th)',
      eventTitle: 'Farhan’s Golden Jubilee Soiree',
      date: '2026-10-31',
      startTime: '18:00',
      durationHours: 5,
      location: 'Dubai, UAE',
      venueType: 'Luxury Waterfront Ballroom & Terrace',
      guestCount: 150,
      budget: 120000,
      currency: 'AED',
      vibeAndTheme: 'Golden Glamour, warm champagne lights, white orchids, sophisticated black-tie with cultural accents',
      cuisinePreference: 'Pan-Middle Eastern & Mediterranean grill, Persian saffron rice, live mezze bar, artisan dessert buffet',
      entertainmentPreference: 'Fusion violinist during cocktails, live 5-piece retro acoustic band, tribute video screening',
      specialRequirements: 'Dedicated memory photo corridor with vintage family portraits, and comfortable lounge clusters.',
    },
  },
  {
    id: 'cultural-eid-dinner',
    badge: 'Festive Dastarkhwan',
    title: 'Festive Dastarkhwan & Eid Celebration',
    tagline: 'Vibrant communal feast with multi-generational games, traditional treats, and festive folk sounds',
    data: {
      eventType: 'Festive Cultural Dinner (Eid / Diwali / Holiday)',
      eventTitle: 'The Grand Eid Dastarkhwan Gathering',
      date: '2026-06-18',
      startTime: '17:30',
      durationHours: 5,
      location: 'Chicago, IL',
      venueType: 'Open-Air Garden Pavilion / Glasshouse',
      guestCount: 120,
      budget: 18000,
      currency: 'USD',
      vibeAndTheme: 'Botanical garden elegance, twinkle light canopies, embroidered table runners, warm festive warmth',
      cuisinePreference: 'Traditional Dum Biryani, Sheer Khurma bar with roasted nuts, Haleem station, Falooda floats',
      entertainmentPreference: 'Acoustic Oud & Santoor instrumentalists, family Antakshari / poetry games, custom photo-booth with ittar favors',
      specialRequirements: 'Family-friendly layout with kids activity craft corner and quiet tea nook.',
    },
  },
];
