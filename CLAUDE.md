# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **AI Nutrition Assistant** - a conversational AI-powered nutrition companion that makes healthy eating decisions effortless through intelligent meal planning, real-time food substitutions, and personalized macro tracking.

**Core Philosophy**: "The AI chat does everything, the UI just displays results" - Users won't fill out forms or tap through menus; they'll have conversations. The dashboard shows what the AI decided, the pantry shows what the AI planned, and all changes happen through chat.

## Development Commands

Since this project is in early planning stages with no code implementation yet, common development commands will be added as the codebase is established. Based on the technical implementation plan:

**Future Expected Commands:**
- `npm install` - Install dependencies
- `npx expo start` - Start development server
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run build` - Build for production

## Technical Architecture

### Recommended Tech Stack
- **Frontend**: React Native + Expo (managed workflow)
- **Backend**: Supabase (primary) + Firebase (push notifications)
- **AI**: GPT-4o-mini for cost optimization
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with biometric support
- **State Management**: Zustand for lightweight state management
- **Chat UI**: react-native-gifted-chat or CometChat React Native UI Kit

### Foundation Repositories to Reference
- `dabit3/react-native-ai` - Complete AI chat framework
- `antomanc/simple-calorie-tracker` - Nutrition tracking patterns
- `Kennygunderman/state-of-health-tracker` - Health analytics and USDA integration

### Key Architectural Patterns

**AI-First State Management:**
- All data changes originate from AI decisions
- UI reflects AI state rather than user input
- Implement "pending approval" flow for AI suggestions

**Conversation-Driven UX:**
- Natural language meal planning
- Conversational food logging with AI assistance
- Smart substitution engine through chat interface

**Data Sources:**
- USDA FoodData Central API (300,000+ foods, free)
- Nutritionix API for natural language processing
- Google Places API for location-based restaurant suggestions

## Development Phases

### MVP (Weeks 1-4): Core Intelligence
1. **Simple Food Diary/Log** - Basic food tracking (free tier)
2. **Conversational Meal Planning** - Natural language meal plan creation
3. **Smart Macro Tracking** - AI-assisted food logging
4. **Basic Substitution Engine** - Home-based meal swaps

### Version 1.0 (Weeks 5-8): Location Intelligence
- Location-based substitutions with Google Maps integration
- Personalized AI coaching conversations
- Grocery list generation from meal plans

### Key Features Implementation Priority
1. Core chat intelligence with conversation memory
2. Three-screen UI foundation (Home, Chat overlay, Pantry)
3. AI-to-database pipeline with real-time updates
4. Location services and restaurant suggestions
5. Meal planning and grocery list generation

## Monetization Structure

**Freemium Model:**
- **Free Tier**: Basic food diary, 3 AI meal plans/month, limited chat interactions
- **Premium ($9.99/month)**: Unlimited AI conversations, photo recognition, location features
- **Premium+ ($19.99/month)**: Condition-specific programs, family planning, advanced analytics

## Performance Requirements

- AI response time < 3 seconds
- App launch time < 2 seconds
- Real-time dashboard updates
- Support for offline meal plan viewing
- Multi-level caching for 60-80% API call reduction

## Security & Compliance

- End-to-end encryption for health data
- HIPAA compliance considerations for future
- Nutritional advice disclaimers
- Biometric authentication support
- PII anonymization in analytics

## Development Guidelines

### Critical Success Metrics
- **Week 1-2**: AI provides 90% accurate macro calculations
- **Week 3**: UI loads with <2 second screen transitions  
- **Week 4**: Real-time data sync between chat and dashboard
- **Week 5**: All core user flows functional
- **Week 6**: Production-ready with no crash bugs

### "Nutritionist in Your Pocket" Test Requirements
1. New user onboarding <2 minutes via chat
2. Meal logging <30 seconds through chat
3. Restaurant finding <1 minute with location
4. Weekly meal planning <3 minutes of conversation
5. User feels like texting a friend, not using an app

## UI/UX Design System

**Visual Style**: Glass morphism design with warm, organic colors
- Cream background (#F4EDE4)
- Teal primary (#264653)
- Orange accent (#E76F51)
- Mustard highlights (#F4A261)
- Sage success states (#9BBF9B)

**Key Screens:**
1. **Today Screen**: Macro rings dashboard with meal timeline
2. **AI Chat**: Conversational interface with contextual suggestions
3. **Pantry**: Inventory tracking with meal planning
4. **Weekly Plan**: Visual meal calendar
5. **Eat Out**: Location-based restaurant recommendations

## Development Acceleration Strategies

- Use proven templates (react-native-ai foundation)
- Implement pre-built chat components
- Leverage AI code generation tools (Workik, RapidNative)
- Multi-service integration (Supabase + Firebase + OpenAI)
- Focus on conversation quality over UI polish initially

## Success Criteria for Launch

**Must Have:**
- AI chat logs food and updates macros in real-time
- Dashboard shows progress visualization
- Restaurant suggestions with location integration
- Meal plan generation with grocery lists
- User authentication and data persistence

**Post-Launch Additions:**
- Photo recognition
- Voice input
- Barcode scanning
- Recipe details
- Social features