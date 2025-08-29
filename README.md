# AI Nutrition Assistant

An AI-powered nutrition companion that makes healthy eating decisions effortless through intelligent meal planning, real-time food substitutions, and personalized macro tracking.

## 🎯 Core Philosophy

"The AI chat does everything, the UI just displays results" - Users don't fill out forms or tap through menus; they have conversations. The dashboard shows what the AI decided, the pantry shows what the AI planned, and all changes happen through chat.

## ✨ Key Features

### MVP Features
- **Conversational Food Logging**: Natural language meal tracking with AI assistance
- **Smart Macro Tracking**: Real-time nutrition analysis and progress visualization
- **Intelligent Meal Planning**: AI-generated weekly meal plans based on preferences
- **Basic Substitution Engine**: Home-based meal swaps with macro matching

### Version 1.0 Features
- **Location-Based Suggestions**: Find macro-friendly restaurants nearby
- **Personalized AI Coaching**: Weekly check-ins and adaptive guidance  
- **Grocery List Generation**: Automatic shopping lists from meal plans
- **Pantry Management**: Track inventory and freshness

## 🛠 Tech Stack

- **Frontend**: React Native + Expo
- **Navigation**: React Navigation 6
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: OpenAI GPT-4o-mini
- **UI Components**: React Native Elements + Custom components
- **Chat**: React Native Gifted Chat

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meal-planner-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `GOOGLE_PLACES_API_KEY`: Google Places API key (for restaurant suggestions)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator / `a` for Android emulator

## 📱 App Architecture

### Screen Structure
```
App
├── HomeScreen (Dashboard with macro rings, today's meals)
├── ChatModal (AI conversation interface)
├── PantryScreen (Inventory management, meal planning)
└── SettingsScreen (Profile, preferences, subscription)
```

### State Management
- **Zustand Store**: Centralized app state with persistence
- **Real-time Updates**: Supabase subscriptions for live data
- **Optimistic UI**: Immediate updates with server sync

### AI Integration
- **Conversation Context**: Maintains user preferences and history
- **Structured Responses**: JSON format for actionable data
- **Fallback Handling**: Graceful degradation when AI unavailable

## 🎨 Design System

### Colors
- **Cream**: `#F4EDE4` (Background)
- **Teal**: `#264653` (Primary actions)
- **Orange**: `#E76F51` (Accent/CTA)
- **Mustard**: `#F4A261` (Warnings/highlights)
- **Sage**: `#9BBF9B` (Success states)

### Components
- **Glass Morphism**: Backdrop blur effects
- **Rounded Cards**: Soft, organic shapes
- **Progress Rings**: Animated macro visualizations
- **Chat Interface**: Conversational UI with quick actions

## 🔧 Development Scripts

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web

# Code quality
npm run lint
npm run type-check

# Build for production
npm run build
```

## 📊 Project Structure

```
src/
├── components/        # Reusable UI components
├── screens/          # Main app screens
├── services/         # API services (OpenAI, Supabase)
├── store/           # Zustand state management
├── constants/       # Configuration, theme, constants
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 🤖 AI Features

### Conversation Engine
- **Context Awareness**: Remembers user preferences and goals
- **Natural Language**: Process food descriptions naturally
- **Action Recognition**: Identifies user intent (log, plan, find food)
- **Structured Output**: Returns actionable data with confidence scores

### Nutrition Analysis
- **Macro Calculation**: Accurate protein, carbs, fat, calories
- **Portion Estimation**: Smart defaults for common foods
- **Database Integration**: USDA food data for accuracy
- **Confidence Scoring**: AI reliability indicators

## 📈 Success Metrics

### Technical KPIs
- AI response time < 3 seconds
- App launch time < 2 seconds
- 99.9% uptime for core features
- Real-time sync < 1 second

### User Experience Goals
- New user onboarding < 2 minutes
- Meal logging < 30 seconds
- 70% meal plan adherence rate
- 4.5+ app store rating

## 🔐 Security & Privacy

- **End-to-end Encryption**: Health data protection
- **Biometric Auth**: Secure app access
- **Data Minimization**: Only collect necessary information
- **GDPR Compliance**: User data rights and deletion
- **API Security**: Rate limiting and request validation

## 🚢 Deployment

### Development
- **Expo Development Build**: Hot reloading and debugging
- **Supabase Staging**: Separate database for testing
- **Environment Variables**: Different configs per environment

### Production
- **App Store Distribution**: iOS App Store and Google Play
- **EAS Build**: Expo Application Services for builds
- **Supabase Production**: Scaled database with backups
- **Analytics**: User behavior and performance monitoring

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Core chat functionality
- [x] Basic meal logging
- [x] Dashboard visualization
- [ ] AI meal planning
- [ ] Location services

### Phase 2
- [ ] Photo food recognition
- [ ] Voice input
- [ ] Barcode scanning
- [ ] Social features
- [ ] Advanced analytics

### Phase 3
- [ ] Wearable integration
- [ ] Recipe generation
- [ ] Family meal planning
- [ ] Grocery delivery integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [CLAUDE.md](CLAUDE.md) file for development guidance
- **Issues**: Report bugs or request features via GitHub Issues
- **Email**: Support at [your-email@domain.com]

---

**Built with ❤️ using React Native, AI, and a passion for healthy living**