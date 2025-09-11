Project Overview
Create a mobile-first web application called RepTracking for tracking gym workout progress. The app should be built using Next.js 14+ with App Router, Tailwind CSS, and pnpm as the package manager. The primary use case is mobile web browsers during gym sessions.

Tech Stack & Configuration:
Framework: Next.js 14+ (App Router)
Styling: Tailwind .env.development.localCSS
Package Manager: pnpm (exclusively)
Database: PostgreSQL (Neon) with Prisma ORM
Authentication: NextAuth.js with database adapter
Deployment Target: Optimized for mobile web browsers

Database Configuration on .env.development.local

Core Features Implementation:
1. Authentication System

Implement NextAuth.js with database sessions
Support email/password authentication
Guest mode functionality (local storage fallback)
User profile management
Secure session handling

2. Database Schema & Models
Create Prisma schema for:

Users: id, email, password, name, created_at
WorkoutPlans: id, user_id, name, description, created_at
Exercises: id, name, category (push/pull/legs/core), is_custom, user_id
WorkoutExercises: id, workout_plan_id, exercise_id, target_sets, target_reps, rest_seconds, order
Sessions: id, user_id, workout_plan_id, started_at, completed_at
Sets: id, session_id, exercise_id, set_number, weight, reps, completed_at
BodyMetrics: id, user_id, weight, body_fat_percentage, recorded_at

3. Exercise Database

Seed database with common exercises categorized by muscle groups
Allow users to create custom exercises
Search and filter functionality
Exercise selection interface optimized for mobile

4. Workout Plan Management (Primary Feature)
Plan Creation:

Create multiple named workout plans
Add exercises with drag-and-drop reordering
Set target sets, reps, and rest periods per exercise
Save as templates for reuse
Quick duplicate functionality

Plan Display:

List view of all workout plans
Preview of exercises in each plan
Last performed date
Quick start button

5. Active Workout Session
Session Initialization:

Select workout plan and start session
Automatic timestamp recording
Display planned exercises with sets x reps format

During Workout:

Exercise selection from plan
Display previous session data (weight, reps) for reference
Set tracking interface with:

Large "Complete Set" button
Auto-incrementing set counter (manually adjustable)
Number inputs for weight and reps
Rest timer that starts automatically after completing a set
Visual rest timer countdown
Option to add extra sets beyond planned


Skip exercise option
Pause/resume session capability

Session Completion:

Summary of completed exercises
Total volume calculation
Session duration
Save session to history

6. Body Metrics Tracking

Simple form for weight entry
Optional body fat percentage
Historical graph view
Progress trends

7. One Rep Max Calculator

Standard 1RM formulas (Brzycki, Epley)
Input: weight and reps
Output: Estimated 1RM and percentage chart
Save calculations to exercise history

8. Progress Analytics

Strength Progression: Line graphs per exercise showing max weight over time
Volume Progression: Total volume (sets × reps × weight) trends
Previous Performance Display: Last 5 sessions for each exercise
Personal Records: Highlight PRs for each exercise

UI/UX Requirements
Mobile-First Design

Minimum touch target size: 44x44px
Large, thumb-friendly buttons
Bottom navigation for primary actions
Swipe gestures for common actions
Responsive layout (320px minimum width)
Fixed header/footer during workouts
Minimal scrolling during active sets

Visual Design

Clean, minimalist interface
High contrast for gym lighting conditions
Large, readable fonts (minimum 16px)
Clear visual hierarchy
Progress indicators and badges
Smooth transitions between screens

Key Screens

Home Dashboard: Quick stats, start workout button, recent sessions
Workout Plans: List view with create/edit/start options
Active Workout: Timer, current exercise, set tracking
Progress: Charts and analytics
Profile: Settings, body metrics, logout

Technical Implementation Details
API Routes (App Router)

/api/auth/* - NextAuth endpoints
/api/workouts - CRUD for workout plans
/api/exercises - Exercise management
/api/sessions - Session tracking
/api/metrics - Body metrics
/api/analytics - Progress data

State Management

React Context for active workout session
Local storage for guest mode
Optimistic updates for better UX
Offline capability for active sessions

Performance Optimizations

Lazy loading for analytics charts
Debounced auto-save during workouts
Service worker for offline functionality
Minimal JavaScript bundle for fast mobile loading

Development Phases
Phase 1: Foundation (MVP)

Project setup with pnpm, Next.js, Tailwind
Database schema and Prisma setup
NextAuth implementation with guest mode
Basic UI components and layout

Phase 2: Core Features

Workout plan CRUD operations
Exercise database and seeding
Active workout session tracking
Rest timer implementation

Phase 3: Enhancement

Progress analytics and charts
Body metrics tracking
One rep max calculator
Previous session display

Phase 4: Polish

Mobile UX optimizations
Performance improvements
Error handling and validation
Testing and bug fixes

File Structure
reptracking/
├── src/app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   ├── workouts/
│   ├── session/
│   ├── progress/
│   └── layout.tsx
├── src/components/
│   ├── ui/
│   ├── workout/
│   └── charts/
├── src/lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── public/
This comprehensive specification provides a complete roadmap for building RepTracking with all requested features optimized for mobile web use during gym sessions.