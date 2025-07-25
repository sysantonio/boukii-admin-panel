# Boukii Admin Panel

Boukii Admin Panel is an Angular 16 application used to manage bookings, clients and courses for Boukii. The project is built on top of the Vex theme and integrates with Boukii's REST APIs.

## Setup

Install dependencies and start the development server:

```bash
npm install
npm start
```

The app runs on `http://localhost:4200` by default.

## Building

Create an optimized build using Angular's production configuration:

```bash
npm run build
# or specify a configuration
ng build --configuration=production
```

## Running Tests

Execute unit tests with Karma and Jasmine:

```bash
npm test
```

Additional commands such as `npm run lint` and `npm run e2e` are defined in `package.json`.

## Booking V3 Module

The repository contains the experimental **booking-v3** module under `src/app/bookings-v3`. This module provides a new booking wizard with a flexible service layer. Services can run against mock data or real API endpoints. The selection is controlled via the `useRealServices` flag in the environment configuration as documented in `src/app/bookings-v3/INTEGRATION-GUIDE.md`.

For a quick demo of the mock implementation see `src/app/bookings-v3/DEMO-SETUP.md`.

---

See `CLAUDE.md` for more development commands and `booking-system-v3-api-specification.md` for API details.
