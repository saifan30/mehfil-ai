# Mehfil AI — Intelligent Celebration & Event Planner

**Live Demo:** https://mehfil-ai-two.vercel.app/

Mehfil AI is an AI-powered celebration planning assistant built for the **PromptWars Virtual 2026 — Celebration & Event Planner** challenge. It transforms event ideas and user preferences into structured, personalized celebration blueprints with practical planning tools.

## 1. Chosen Challenge Vertical

**Celebration & Event Planner**

Mehfil AI helps users plan weddings, birthdays, cultural gatherings, anniversaries, and other celebrations according to their event requirements, budget, guest count, venue preferences, and desired atmosphere.

## 2. Problem Statement

Planning a celebration involves coordinating budgets, schedules, vendors, menus, event spaces, and personal preferences. Managing these details manually can be time-consuming and may lead to missed tasks or overspending.

Mehfil AI brings these planning activities together in one application and uses generative AI to help users create a practical starting plan tailored to their event.

## 3. Approach and Decision-Making Logic

Mehfil AI follows a structured, context-aware planning workflow:

1. **Understand the Event:** Collect event type, title, date, start time, duration, destination, guest count, budget, currency, venue style, ambiance, culinary preferences, entertainment choices, and cultural notes.
2. **Validate Inputs:** Validate required fields and numeric boundaries before sending requests to the backend.
3. **Generate a Personalized Plan:** Send the relevant event context to the server-side Google Gemini integration to generate a tailored celebration blueprint.
4. **Organize the Results:** Present planning information through interactive sections for the event timeline, budget, vendors, menu, color palette, and spatial zones.
5. **Support Decisions:** Provide budget calculations, cost-per-guest estimates, expense variance tracking, category balancing, and AI-powered planning suggestions.
6. **Refine and Manage:** Allow users to adjust planning details, track progress, save drafts, and export or restore their planning data.

The generated plan is a starting point that users can review and customize rather than a fixed or guaranteed event arrangement.

## 4. Key Features

### AI-Powered Planning
- Personalized celebration blueprint generation using Google Gemini.
- Contextual recommendations through an AI Co-Pilot.
- Suggestions for event scripts, menu improvements, and contingency planning.

### Interactive Timeline
- Organize event phases and activities.
- Track completion of timeline items.
- Manage lighting and audio cues, operational responsibilities, and custom activities.

### Budget Management
- Support multiple currencies: INR, USD, GBP, AED, EUR, and CAD.
- Track allocated and actual spending.
- Calculate cost per guest and budget variance.
- Adjust category percentages and automatically balance allocations to 100%.
- Display contingency information and cost-saving suggestions.

### Vendor Management
- Organize vendors by category.
- Track booking status, priority, deadlines, and deliverables.
- Monitor vendor-related expenses.

### Menu and Event Design
- Plan multi-course menus with dietary labels.
- Customize event color palettes and copy hexadecimal color codes.
- Organize event zones and seating areas according to the celebration plan.

### Export and Persistence
- Print-friendly layouts for saving plans as PDF through the browser's print dialog.
- Copyable Markdown summaries.
- JSON backup and import restoration.
- Local browser draft saving with handling for storage errors.

### Responsive and Accessible Interface
- Responsive layouts for different screen sizes.
- Accessible labels and keyboard-operable interactive controls where implemented.
- Focus indicators and horizontally scrollable wide tables.

## 5. How the Solution Works

The application follows this high-level flow:

**User Input → Frontend Validation → Backend API → Google Gemini → Structured Celebration Plan → Interactive Planning Dashboard**

- The React frontend collects and displays event information.
- The backend validates requests and communicates with the Gemini API.
- The generated result is presented through dedicated planning sections.
- Users can review, customize, save, and export their plans.

The application includes the following API endpoints:

- `GET /api/health` — reports backend health and whether Gemini is configured.
- `POST /api/generate-plan` — generates a celebration blueprint.
- `POST /api/ai-suggest` — provides contextual celebration advice.

## 6. Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express
- **Generative AI:** Google GenAI SDK and Gemini API
- **Styling:** Tailwind CSS
- **Icons and UI:** Lucide React and Motion
- **Deployment:** Vercel
- **Persistence:** Browser localStorage with JSON backup and restoration

## 7. Security and Responsible Implementation

- The Gemini API key is configured as a server-side environment variable.
- API credentials should never be exposed in frontend code or committed to version control.
- Backend input validation and sanitization help reduce malformed or unsafe requests.
- Rate limiting helps control excessive API requests.
- Request timeouts and structured error handling help the application respond to upstream failures.
- AI-generated budgets, recommendations, menus, and schedules should be reviewed by users before real-world use.

Never commit real API keys, `.env` files, access tokens, or other secrets to the public repository.

## 8. Testing and Validation

The project includes automated tests for areas such as:

- Currency and date formatting.
- Budget calculations and numerical edge cases.
- Budget allocation normalization.
- Invalid request handling and input validation.
- JSON import structure validation.
- Local storage error handling.
- API endpoint behavior and rate limiting.

Build, TypeScript, and test commands should be run against the current repository before submission. Test results may depend on the configured environment and available API credentials.

## 9. Assumptions and Limitations

- Users provide accurate event details, guest counts, budgets, and preferences.
- AI-generated vendor costs and budget estimates are suggestions, not verified market quotations.
- Vendor availability, actual prices, venue permissions, and bookings must be confirmed independently.
- AI-generated recommendations may require review or correction.
- Plan generation depends on external Gemini API availability and can take several seconds.
- Browser-local drafts are stored on the current device and browser; they are not automatically synchronized across devices.
- Local storage is subject to browser storage limits.
- PDF export uses the browser's print functionality.

## 10. Local Setup

### Prerequisites
- Node.js and a compatible package manager.
- A Google Gemini API key.
- Git.

### Installation

1. Clone the public repository:

   ```bash
   git clone https://github.com/saifan30/mehfil-ai
   cd mehfil-ai
   ```

2. Install dependencies using the package manager supported by the repository.

3. Configure the required environment variable in your local environment:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development command defined in `package.json`.

5. Open the local URL provided by the development server.

**Note:** Never replace the placeholder above with a real API key in this README. Configure the actual key locally or through the deployment platform's environment settings.

## 11. Challenge Information

- **Project:** Mehfil AI
- **Challenge:** PromptWars Virtual 2026
- **Chosen Vertical:** Celebration & Event Planner
- **Live Application:** https://mehfil-ai-two.vercel.app/

Mehfil AI aims to make celebration planning more organized, personalized, and practical by combining generative AI with interactive planning and budgeting tools.

---

*Built for PromptWars Virtual 2026.*
