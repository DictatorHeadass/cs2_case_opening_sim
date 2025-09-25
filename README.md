# Overview

This is a CS2 (Counter-Strike 2) Case Opening Simulator - a complete web-based gaming application that replicates the case opening mechanics from Counter-Strike 2. The application features a comprehensive economy system with 15 different case types across multiple price tiers, realistic rarity distributions, inventory management, and trading mechanics. Users start with $1000 and can buy cases, open them to receive items, manage their inventory, and participate in trade-up contracts.

The application uses a modern full-stack architecture with React frontend, Express backend, and PostgreSQL database, implementing authentic CS2 game mechanics including StatTrak™ items, wear conditions, and proper rarity distributions from Consumer (79.92%) to Knife (0.026%).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: Wouter for lightweight client-side routing with pages for Cases, Inventory, Market, Trade-Up, and Statistics
- **State Management**: React hooks with custom `useGameState` hook for centralized game state management
- **UI Components**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **Data Fetching**: TanStack Query for server state management and caching
- **Responsive Design**: Mobile-first approach with bottom navigation for mobile and traditional navbar for desktop

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with routes for game state, inventory items, and case cooldowns
- **Storage Layer**: Abstracted storage interface (`IStorage`) with in-memory implementation for development
- **Development Setup**: Vite integration for hot module replacement in development mode
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

## Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM for type-safe database operations
- **Schema Design**: 
  - Users table for authentication
  - Game states for user progress and statistics
  - Inventory items with detailed metadata (rarity, condition, StatTrak™, values)
  - Case cooldowns for free tier limitations
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Connection**: Neon Database serverless PostgreSQL for production

## Game Logic & Economy
- **Case Opening Engine**: Sophisticated probability system matching CS2's actual drop rates
- **Item Generation**: Dynamic wear condition and StatTrak™ assignment with market variance (70-130%)
- **Trade-Up System**: Authentic 10-to-1 item upgrading matching CS2 mechanics
- **Achievement System**: Progress tracking and unlockable achievements
- **Market Simulation**: Dynamic pricing with realistic market fluctuations

## Authentication & Authorization
- Currently using local storage for development with user sessions
- Database schema prepared for proper user authentication system
- Session-based approach planned with secure password handling

# External Dependencies

## Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Drizzle Kit**: Database migrations and schema management

## UI & Styling
- **Shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Low-level accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development environment integration for cartographer and dev banner

## Data Visualization
- **Recharts**: Charting library for statistics and data visualization

## Routing & Navigation
- **Wouter**: Lightweight client-side routing library

## State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
