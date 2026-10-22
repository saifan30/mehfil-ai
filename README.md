# Mehfil AI — AI-Powered Celebration Planner

**Live Demo:** https://mehfil-ai-two.vercel.app/

Mehfil AI is a full-stack, AI-powered celebration planning application built for the PromptWars Celebration & Event Planner challenge. It helps users turn event ideas into structured, personalized celebration blueprints.

## Features

- **AI Celebration Blueprints:** Generate personalized event plans using Google Gemini.
- **Budget Ledger:** Track allocations, actual expenses, budget variance, and cost per guest.
- **Interactive Timeline:** Organize event phases, cues, responsibilities, and custom activities.
- **Vendor Management:** Track vendor bookings, deadlines, priorities, and deliverables.
- **Moodboard & Color Palette:** Explore event themes and copy palette color codes.
- **Menu Planning:** Organize multi-course menus with dietary labels.
- **Seating & Event Zones:** Plan guest areas and event spaces.
- **AI Co-Pilot:** Get contextual suggestions for event scripts, menus, and contingency planning.
- **Export & Persistence:** Print-ready PDF, Markdown summary, JSON backup/import, and local draft saving.

## Tech Stack

- React, TypeScript, and Vite
- Node.js and Express
- Google GenAI SDK and Gemini API
- Tailwind CSS
- Vercel deployment

## Getting Started

1. Clone this repository.
2. Install dependencies using the package manager supported by the project.
3. Configure the required environment variables.
4. Run the development server using the project's configured scripts.

Refer to the project's package scripts and server configuration for the exact commands.

## Environment Variables

Configure `GEMINI_API_KEY` in your local environment or deployment platform. Never commit real API keys or `.env` files to the repository.

## Testing

The project includes automated tests for currency formatting, budget calculations, validation, persistence resilience, and API behavior. Run the test command configured in the project to verify the current implementation.

## Security

API credentials are intended to remain server-side. Inputs are validated by the backend, and API requests are subject to rate limiting.

## Challenge

Built for the **PromptWars Virtual 2026 — Celebration & Event Planner** track.

