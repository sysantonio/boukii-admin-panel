# Boukii Admin Panel

## Node version

This project expects **Node.js 16**. The application has been tested with
Node.js 16.20.2. Using other major versions may result in unexpected errors.

When you're done, you can delete the content in this README and update the file with details for others getting started with your repository.
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

Now that you're more familiar with your Bitbucket repository, go ahead and add a new file locally. You can [push your change back to Bitbucket with SourceTree](https://confluence.atlassian.com/x/iqyBMg), or you can [add, commit,](https://confluence.atlassian.com/x/8QhODQ) and [push from the command line](https://confluence.atlassian.com/x/NQ0zDQ).

## License

This project is licensed under the [MIT License](LICENSE).

See `CLAUDE.md` for more development commands and `booking-system-v3-api-specification.md` for API details.

