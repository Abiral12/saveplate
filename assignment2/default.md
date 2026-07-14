# SavePlate

SavePlate is a modern household food-management platform designed to help people organise food, monitor expiry dates, reduce unnecessary waste, and share usable surplus food responsibly.

The platform combines household inventory management, expiry awareness, food donation, meal planning, notifications, and food-saving analytics in one accessible web application.

---

## Project Vision

Food is often wasted because households:

- forget what they already have;
- do not notice approaching expiry dates;
- purchase duplicate products;
- lack an organised meal-planning process;
- have no simple way to share surplus food.

SavePlate addresses these problems by giving each household a private digital food inventory and helping users decide whether to:

- use an item;
- include it in a meal;
- mark it as consumed;
- or publish it as a donation.

### Product statement

> Know what you have. Use it in time. Share what you cannot use.

---

## Core Objectives

SavePlate aims to:

1. Help households maintain an accurate food inventory.
2. Highlight food approaching its expiry date.
3. Reduce unnecessary and duplicate food purchases.
4. Allow unused food to be converted into donation listings.
5. Protect household information through controlled privacy settings.
6. Support meal planning using currently available ingredients.
7. Provide useful notifications and food-saving analytics.

---

## Current Development Phase

The project is currently focused on the first functional release.

### Iteration 1 scope

- Premium responsive landing page
- Household-user registration
- Email verification using a six-digit code
- Login and logout
- Custom session-based authentication
- Protected household dashboard
- Privacy settings
- Food inventory creation
- Food inventory listing
- Food item details
- Food item editing
- Food item soft deletion
- Marking food as used
- Uploading food images
- Converting food items into donation listings
- Browsing available donation listings
- Searching and filtering food listings
- Positive and negative testing

### Planned for Iteration 2

- Donation claiming
- Pickup coordination
- Expiry notifications
- Weekly meal planning
- Ingredient-based meal suggestions
- Food-saving analytics
- Progress charts
- Notification centre
- More extensive automated testing

---

# Technology Stack

## Application

| Area | Technology |
|---|---|
| Framework | Next.js with App Router |
| Language | TypeScript |
| Frontend | React |
| Styling | Tailwind CSS |
| UI components | shadcn/ui with Base UI |
| Icons | Lucide React |
| Animations | Motion |
| Validation | Zod |
| ORM | Prisma |
| Database | Supabase PostgreSQL |
| File storage | Supabase Storage |
| Password hashing | bcryptjs |
| Authentication | Custom backend authentication |
| Session management | Database-backed opaque sessions |
| Deployment | Vercel |
| Version control | Git and GitHub |

---

# Important Supabase Decision

SavePlate does **not** use Supabase Authentication.

Supabase is used only for:

- PostgreSQL database hosting;
- food-image storage.

Registration, login, email verification, password handling, authorisation, session creation, and session revocation are implemented by the SavePlate backend.

```text
Supabase PostgreSQL  → Application data
Supabase Storage     → Food images
SavePlate backend    → Authentication and authorisation
```

The browser must never communicate directly with the database or use the Supabase service-role key.

---

# System Architecture

SavePlate uses a full-stack Next.js architecture.

```text
Browser
   │
   │ HTTPS requests
   ▼
Next.js application
   │
   ├── React pages and components
   ├── Next.js Route Handlers
   ├── Zod request validation
   ├── Authentication and authorisation
   ├── Business rules
   │
   ├── Prisma
   │      │
   │      ▼
   │   Supabase PostgreSQL
   │
   └── Supabase server client
          │
          ▼
       Supabase Storage
```

## Request flow

A normal backend request follows this flow:

```text
Frontend component
        ↓
Next.js API Route Handler
        ↓
Session authentication
        ↓
Input validation
        ↓
Business rules
        ↓
Prisma or Storage service
        ↓
Supabase
        ↓
Standard API response
```

Example:

```text
Add Food Item form
        ↓
POST /api/inventory
        ↓
Validate logged-in user
        ↓
Validate request with Zod
        ↓
Create food item through Prisma
        ↓
Store record in Supabase PostgreSQL
```

---

# Authentication Architecture

Authentication is controlled entirely by the SavePlate backend.

## Registration flow

```text
User submits registration form
        ↓
Validate input
        ↓
Normalise email address
        ↓
Check duplicate email
        ↓
Hash password
        ↓
Create pending user
        ↓
Generate six-digit verification code
        ↓
Store hashed verification code
        ↓
Send verification email
```

## Email verification flow

```text
User enters verification code
        ↓
Validate code
        ↓
Check expiry time
        ↓
Mark code as used
        ↓
Activate account
```

## Login flow

```text
User submits email and password
        ↓
Find active user
        ↓
Compare password hash
        ↓
Generate secure random session token
        ↓
Store token hash in database
        ↓
Store raw token in HTTP-only cookie
```

## Protected request flow

```text
Read session cookie
        ↓
Hash session token
        ↓
Find matching database session
        ↓
Check expiry and revocation
        ↓
Load authenticated user
        ↓
Allow or reject request
```

## Session-cookie requirements

The session cookie must be:

- HTTP-only;
- secure in production;
- SameSite protected;
- unavailable to client-side JavaScript;
- removable during logout;
- backed by a revocable database session.

---

# Main Application Modules

## 1. Public website

The public landing page introduces SavePlate and explains:

- the food-waste problem;
- how SavePlate works;
- the main product benefits;
- privacy principles;
- registration and login actions.

## 2. User accounts

Household users can:

- register;
- verify their email;
- log in;
- log out;
- maintain a secure session;
- update privacy settings.

## 3. Food inventory

Users can:

- add food items;
- upload food images;
- record quantities and units;
- select food categories;
- record storage locations;
- record expiry dates;
- add notes;
- search and filter inventory;
- edit items;
- mark items as used;
- soft-delete items.

## 4. Food donations

Users can:

- convert an available food item into a donation;
- provide pickup information;
- define availability;
- browse available donations;
- search by item name;
- filter by category or location;
- view donation details.

## 5. Privacy settings

Users control:

- listing visibility;
- contact-information visibility;
- expiry-alert preferences;
- donation-alert preferences.

## 6. Future modules

Later releases will include:

- meal planning;
- notifications;
- donation claiming;
- food analytics;
- recipe suggestions.

---

# Main User Journey

The primary Iteration 1 experience is:

```text
Visit landing page
        ↓
Register household account
        ↓
Verify email
        ↓
Log in
        ↓
Open protected dashboard
        ↓
Add food to inventory
        ↓
Upload food image
        ↓
Edit or mark food as used
        ↓
Convert unused food into a donation
        ↓
Browse donation listings
        ↓
Update privacy settings
        ↓
Log out
```

---

# Project Structure

The project intentionally uses a straightforward structure without unnecessary abstraction.

```text
assignment2/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── inventory/
│   │   ├── donations/
│   │   └── settings/
│   │
│   ├── login/
│   ├── register/
│   ├── verify-email/
│   ├── dashboard/
│   ├── inventory/
│   ├── donations/
│   ├── settings/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── landing/
│   ├── auth/
│   ├── inventory/
│   ├── donations/
│   ├── layout/
│   └── ui/
│
├── lib/
│   ├── auth/
│   ├── db/
│   ├── email/
│   ├── security/
│   ├── supabase/
│   ├── validation/
│   └── utils.ts
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── components.json
├── next.config.ts
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

Some folders will be created as their corresponding features are implemented.

---

# Folder Responsibilities

## `app`

Contains:

- application pages;
- layouts;
- loading and error states;
- Next.js API Route Handlers.

Page files should focus on route composition and data presentation.

## `components`

Contains reusable React components.

```text
components/landing    → landing-page sections
components/auth       → registration and login forms
components/inventory  → food inventory components
components/donations  → donation components
components/layout     → navigation, sidebar, headers
components/ui         → shadcn UI components
```

## `lib`

Contains backend and shared infrastructure.

```text
lib/auth        → sessions and current-user utilities
lib/db          → Prisma database client
lib/email       → verification-email service
lib/security    → password and token utilities
lib/supabase    → server-side storage client
lib/validation  → reusable validation rules
```

## `prisma`

Contains:

- database schema;
- migrations;
- seed data.

## `tests`

Contains:

- unit tests;
- integration tests;
- end-to-end tests.

---

# UI and Design System

SavePlate uses a premium sustainability-focused visual identity.

The interface should feel:

- modern;
- calm;
- trustworthy;
- practical;
- environmentally responsible;
- accessible;
- visually consistent.

## Brand colours

| Role | Colour | Hex |
|---|---|---|
| Deep brand background | Deep emerald | `#052E24` |
| Primary brand colour | Emerald | `#065F46` |
| Interactive green | Fresh green | `#10B981` |
| Accent | Lime | `#BEF264` |
| Page background | Warm off-white | `#F7F8F3` |
| Card background | White | `#FFFFFF` |
| Warning background | Soft orange | `#FFF7ED` |
| Warning colour | Orange | `#EA580C` |
| Main text | Green-black | `#10271F` |

## Colour usage

### Deep emerald

Used for:

- primary buttons;
- dark sections;
- navigation emphasis;
- important icons;
- strong headings.

### Lime

Used for:

- highlights;
- status indicators;
- selected states;
- decorative accents;
- primary CTA emphasis on dark backgrounds.

### Warm off-white

Used as the main page background to avoid a harsh pure-white interface.

### Orange

Used only for:

- food approaching expiry;
- warnings;
- urgent attention states.

It should not be used as the primary brand colour.

---

# Typography

The primary application font is **Manrope**.

Typography principles:

- large editorial headlines;
- high readability;
- strong visual hierarchy;
- limited font-weight variation;
- consistent line spacing;
- no more than one primary interface font.

Suggested hierarchy:

```text
Hero heading       → 52–105 px depending on viewport
Section heading    → 36–60 px
Card heading       → 20–28 px
Body text          → 16–20 px
Supporting text    → 12–14 px
```

---

# UI Principles

Every page should follow these principles:

1. Maintain consistent spacing and alignment.
2. Use rounded cards without making the interface childish.
3. Use shadows subtly.
4. Keep forms simple and clearly labelled.
5. Display errors beside the relevant field.
6. Provide visible loading, empty, success, and error states.
7. Use confirmation dialogs for destructive actions.
8. Use status badges consistently.
9. Design mobile layouts first.
10. Keep navigation predictable.
11. Use animation to support understanding, not distract users.
12. Respect reduced-motion accessibility preferences.

---

# Animation Principles

SavePlate uses Motion for purposeful animation.

Animations include:

- hero-content entrance;
- dashboard-preview movement;
- section reveal on scroll;
- staggered feature-card entrances;
- subtle button and icon interactions;
- progress-bar animation;
- soft background movement.

Animation rules:

- use transforms and opacity for performance;
- avoid excessive continuous animation;
- keep transitions between approximately 200 and 700 milliseconds;
- disable or reduce effects when the user prefers reduced motion;
- never block interaction while an animation is running.

---

# Planned Application Routes

## Public routes

```text
/
 /login
 /register
 /verify-email
```

## Protected routes

```text
/dashboard
/inventory
/inventory/new
/inventory/[id]
/inventory/[id]/edit
/donations
/donations/[id]
/settings/privacy
```

## API routes

### Authentication

```text
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-code
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Inventory

```text
GET    /api/inventory
POST   /api/inventory
GET    /api/inventory/[id]
PATCH  /api/inventory/[id]
DELETE /api/inventory/[id]
POST   /api/inventory/[id]/mark-used
POST   /api/inventory/[id]/images
DELETE /api/inventory/[id]/images
POST   /api/inventory/[id]/donate
```

### Donations

```text
GET /api/donations
GET /api/donations/[id]
```

### Settings

```text
GET   /api/settings/privacy
PATCH /api/settings/privacy
```

---

# Planned Database Entities

## User

Stores:

- full name;
- email;
- password hash;
- household size;
- account status;
- verification status;
- timestamps.

## Session

Stores:

- user reference;
- session-token hash;
- expiration time;
- revocation time;
- creation time.

## EmailVerificationCode

Stores:

- user reference;
- verification-code hash;
- expiration time;
- usage time.

## PrivacySetting

Stores:

- listing visibility;
- contact-information visibility;
- notification preferences.

## FoodItem

Stores:

- owner;
- item name;
- quantity;
- unit;
- category;
- storage location;
- expiry date;
- notes;
- status;
- timestamps.

## FoodItemImage

Stores:

- food-item reference;
- Supabase object path;
- original filename;
- MIME type;
- file size.

## DonationListing

Stores:

- food-item reference;
- owner;
- pickup location;
- availability;
- contact method;
- listing status;
- additional details.

---

# Important Status Transitions

## Account

```text
PENDING_VERIFICATION
        ↓
      ACTIVE
        ↓
    SUSPENDED
```

## Food item

```text
AVAILABLE
   ├── USED
   ├── DONATED
   ├── EXPIRED
   └── DELETED
```

## Donation listing

```text
AVAILABLE
   ├── CLAIMED
   ├── CANCELLED
   └── EXPIRED

CLAIMED
   ├── COMPLETED
   └── CANCELLED
```

Invalid state changes must be rejected by backend business rules.

---

# Food Image Storage

Food images are stored in a private Supabase Storage bucket.

Suggested bucket:

```text
food-images
```

Suggested storage structure:

```text
users/
└── {userId}/
    └── food-items/
        └── {foodItemId}/
            └── {uniqueFileName}.webp
```

PostgreSQL stores only the object path and image metadata.

The application must not permanently store expiring signed URLs.

Allowed image formats:

- JPEG
- PNG
- WebP

Recommended maximum upload size:

```text
5 MB
```

Before every upload or deletion, the backend must verify that the authenticated user owns the food item.

---

# Security Requirements

## Password security

- Passwords are hashed using bcrypt.
- Plain-text passwords are never stored.
- Password hashes are never returned by APIs.
- Password validation is performed on the server.

## Session security

- Session tokens are generated cryptographically.
- Raw session tokens are stored only in HTTP-only cookies.
- Only session-token hashes are stored in PostgreSQL.
- Logout revokes the matching database session.
- Expired and revoked sessions are rejected.

## Authorisation

Every protected API must:

1. validate the session;
2. load the authenticated user;
3. verify ownership;
4. validate the requested state change.

Example:

```text
foodItem.ownerId must equal authenticatedUser.id
```

Checking only the item ID is not sufficient.

## Secret management

These values must never be committed to Git:

- database password;
- `DATABASE_URL`;
- `DIRECT_URL`;
- Supabase service-role key;
- SMTP credentials;
- session secrets.

The Supabase service-role key must never use the `NEXT_PUBLIC_` prefix.

---

# Environment Variables

Create a local `.env` file based on `.env.example`.

```env
# Application
APP_URL=http://localhost:3000

# Supabase PostgreSQL
DATABASE_URL=
DIRECT_URL=

# Supabase Storage
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=food-images

# Custom authentication
SESSION_COOKIE_NAME=saveplate_session
SESSION_DURATION_DAYS=7

# Email verification
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
```

Never commit the real `.env` file.

---

# Local Development

## Requirements

- Node.js
- npm
- Git
- Supabase project
- PostgreSQL connection details

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd saveplate/assignment2
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

On Windows, create `.env` manually when `cp` is unavailable.

Generate the Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate dev
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build locally.

```bash
npm run lint
```

Runs ESLint.

Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

---

# Code Organisation Rules

## Pages

Page files should:

- compose the route;
- retrieve required data;
- render feature components;
- avoid large business logic.

## Components

Components should:

- represent reusable UI;
- remain focused on presentation and interaction;
- avoid direct database access.

## Route Handlers

Route Handlers should:

1. authenticate;
2. parse the request;
3. validate input;
4. call business logic;
5. return a standard response.

## Database access

Prisma must only run on the server.

Client components must never import:

- Prisma;
- database configuration;
- the Supabase service-role client;
- password utilities;
- session-token utilities.

## Validation

All important input must be validated on the backend even when frontend validation already exists.

---

# API Response Format

Successful response:

```json
{
  "success": true,
  "message": "Food item created successfully.",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Unable to create food item.",
  "errors": {}
}
```

HTTP status codes should be used consistently:

| Status | Usage |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `400` | Invalid request |
| `401` | Authentication required |
| `403` | Access forbidden |
| `404` | Resource not found |
| `409` | Duplicate or state conflict |
| `422` | Validation failure |
| `500` | Unexpected server error |

---

# Validation Requirements

## Registration

- Full name is required.
- Email must be valid.
- Email must be unique.
- Password must meet strength requirements.
- Password confirmation must match.
- Household size must be valid when supplied.

## Inventory

- Item name is required.
- Quantity must be greater than zero.
- Unit is required.
- Category is required.
- Expiry date must be valid.
- Notes must respect length limits.
- Users may only modify their own items.

## Donation

- The food item must belong to the logged-in user.
- The food item must be available.
- The food item must not already have a donation listing.
- Pickup location is required.
- Availability must be valid.

---

# Testing Strategy

## Unit testing

Used for:

- validation schemas;
- token utilities;
- password rules;
- state-transition rules;
- reusable business functions.

## Integration testing

Used for:

- registration;
- login;
- session handling;
- inventory operations;
- ownership checks;
- donation creation;
- database persistence.

## End-to-end testing

Used for complete browser journeys:

```text
Register
→ Verify
→ Login
→ Add food
→ Edit food
→ Mark food as used
→ Convert food to donation
→ Browse donation
→ Logout
```

Every important user story should include:

- at least one positive scenario;
- negative scenarios;
- boundary validation;
- authorisation testing where applicable.

---

# Git Workflow

Recommended branches:

```text
main
develop
feature/auth
feature/inventory
feature/donations
feature/privacy-settings
test/iteration-1
```

Development rules:

1. Do not push unfinished work directly to `main`.
2. Use one branch per feature.
3. Write meaningful commit messages.
4. Pull the latest `develop` branch before starting.
5. Open a pull request after completing a feature.
6. Review changes before merging.
7. Resolve conflicts locally.
8. Run lint and build before opening a pull request.

Example commit messages:

```text
feat(auth): implement household registration
feat(inventory): add food item creation
fix(donations): prevent duplicate donation listing
test(auth): add invalid verification code test
refactor(landing): simplify hero component structure
```

---

# Definition of Done

A feature is complete only when:

- acceptance criteria are satisfied;
- frontend behaviour is complete;
- backend validation is implemented;
- authentication is checked;
- ownership is verified;
- loading and error states are handled;
- responsive behaviour is tested;
- positive tests pass;
- negative tests pass;
- lint passes;
- production build succeeds;
- changes are committed clearly;
- the pull request has been reviewed.

---

# Deployment

The application is deployed through Vercel.

Because the Next.js application is inside a nested directory, the Vercel project must use:

```text
Root Directory: assignment2
Framework Preset: Next.js
Build Command Override: Disabled
Output Directory Override: Disabled
Install Command Override: Disabled
```

Supabase environment variables must be configured separately in Vercel.

Before deployment:

```bash
npm run lint
npm run build
```

---

# Product Principles

SavePlate should always remain:

- simple enough for non-technical households;
- private by default;
- useful before being complex;
- accessible across different devices;
- transparent about how information is used;
- focused on reducing real household food waste.

---

# Project Status

```text
Landing page                 Completed
Supabase database setup      In progress
Custom authentication        Planned
Email verification           Planned
Protected dashboard          Planned
Food inventory               Planned
Supabase image storage       Planned
Donation listings            Planned
Iteration 1 testing          Planned
Meal planning                Iteration 2
Notifications                Iteration 2
Food analytics               Iteration 2
```

---

# Team

SavePlate is being developed collaboratively using GitHub.

Each team member is responsible for complete user stories, including:

- interface implementation;
- backend logic;
- validation;
- testing;
- Git contribution.

---

# Licence

This project is currently developed for educational and prototype purposes. A formal licence should be selected before public commercial distribution.