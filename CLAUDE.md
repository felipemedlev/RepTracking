# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RepTracking is a mobile-first gym workout tracking web application built with Next.js 15+ App Router, Tailwind CSS, and TypeScript. The app is optimized for mobile web browsers during gym sessions.

## Tech Stack

- **Framework**: Next.js 15+ with App Router and Turbopack
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm (exclusively - never use npm or yarn)
- **Database**: PostgreSQL (Neon) with Prisma ORM (planned)
- **Authentication**: NextAuth.js with database adapter (planned)
- **TypeScript**: Strict configuration enabled

## Development Commands

```bash
# Start development server with Turbopack
pnpm dev

# Build production application with Turbopack
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components (planned structure from Plan.md)
  - `ui/` - Reusable UI components
  - `workout/` - Workout-specific components
  - `charts/` - Analytics chart components
- `lib/` - Utility functions and configurations
- `prisma/` - Database schema and seed files
- TypeScript path alias: `@/*` maps to `./src/*`

## Key Features (from Plan.md)

The application focuses on mobile-first workout tracking with these core features:
- Workout plan management with drag-and-drop reordering
- Active workout sessions with rest timers
- Exercise database with custom exercise support
- Progress analytics and 1RM calculator
- Body metrics tracking
- Guest mode with local storage fallback

## Mobile-First Requirements

- Minimum touch target: 44x44px
- Large, thumb-friendly buttons
- Bottom navigation for primary actions
- Responsive layout (320px minimum width)
- High contrast for gym lighting conditions
- Large, readable fonts (minimum 16px)

## Database Schema (Planned)

Key models include Users, WorkoutPlans, Exercises, WorkoutExercises, Sessions, Sets, and BodyMetrics. Full schema details are in Plan.md.

## API Routes Structure (Planned)

- `/api/auth/*` - NextAuth endpoints
- `/api/workouts` - Workout plan CRUD
- `/api/exercises` - Exercise management
- `/api/sessions` - Session tracking
- `/api/metrics` - Body metrics
- `/api/analytics` - Progress data