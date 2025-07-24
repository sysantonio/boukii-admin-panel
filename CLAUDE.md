# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `npm start` - Start development server
- `npm run start2` - Start development server without live reload
- `npm run build` - Build the application (uses increased memory allocation)
- `npm test` - Run unit tests with Karma
- `npm run lint` - Run linting
- `npm run e2e` - Run end-to-end tests

### Environment-Specific Commands
The project supports multiple environments via Angular configurations:
- Production: `ng build --configuration=production`
- Development: `ng build --configuration=development` 
- Local: `ng build --configuration=local`

## Architecture Overview

### Project Structure
This is an Angular 16 admin panel application called "Boukii Admin Panel" built on the Vex theme framework.

**Key Directories:**
- `src/@vex/` - Vex theme framework components, layouts, and utilities
- `src/app/pages/` - Main application pages (dashboard, analytics, bookings, courses, etc.)
- `src/service/` - Core services for API, authentication, and business logic
- `src/environments/` - Environment-specific configurations

### Core Technologies
- Angular 16 with TypeScript
- Angular Material for UI components
- TailwindCSS for styling (custom configuration)
- RxJS for reactive programming
- Firebase for authentication
- ApexCharts for data visualization
- Various specialized libraries (Calendar, QR codes, Excel export, etc.)

### Application Structure

**Main Features:**
- Dashboard with analytics widgets
- Client management
- Course/booking management (v1 and v2 implementations)
- Monitor management
- Calendar integration
- Communication/chat system
- Analytics and reporting
- Admin user management

**Key Services:**
- `ApiService` - HTTP client with authentication headers
- `AuthService` - Authentication and user management
- `ConfigService` - Vex theme configuration management
- Various domain-specific services (analytics, bookings, courses, etc.)

### Component Architecture
- Uses Vex theme's modular component system
- Custom components in `src/app/components/`
- Shared widgets in `src/@vex/components/widgets/`
- Layout system with configurable sidenav, toolbar, and footer

### Styling System
- Custom TailwindCSS configuration with Vex theme integration
- CSS custom properties for dynamic theming
- SCSS for component-specific styles
- Material Design theming support

### API Integration
- Base API URL configured per environment
- JWT token-based authentication stored in localStorage
- HTTP interceptors for authentication headers

### State Management
- Primarily uses Angular services with RxJS for state management
- Component-level state for UI interactions
- Configuration service for theme/layout state

### Internationalization
- Uses ngx-translate for multi-language support
- Translation files in `src/assets/i18n/` (supports EN, ES, FR, DE, IT)

## Development Notes

### Testing
- Karma + Jasmine for unit tests
- Test configuration in `karma.conf.js`
- Spec files co-located with components

### Build Configuration
- Memory allocation increased for build process (`--max-old-space-size=4096`)
- Multiple environment configurations with different base URLs and Firebase configs
- Asset optimization and bundling configured in `angular.json`

### Code Patterns
- Uses Angular best practices with decorators and dependency injection
- RxJS operators heavily used for reactive programming
- UntilDestroy pattern for subscription management
- TypeScript strict mode enabled