# Technical Architecture - Meal Master AI
*Hybrid API Integration & Conversational Intelligence*

## System Overview

Meal Master AI implements a hybrid API architecture that combines multiple nutrition data sources with conversational AI to provide intelligent meal planning, food tracking, and nutritional guidance through natural language interactions.

## High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │    │  Conversational  │    │  Hybrid API     │
│   Mobile App    │◄──►│     AI Layer     │◄──►│   Gateway       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Zustand       │    │   OpenAI GPT     │    │  3 API Sources  │
│  State Store    │    │   (4o-mini)      │    │  + Supabase     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Layer Architecture

### Multi-API Integration Strategy

The system integrates four data sources in a prioritized hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Open Food      │   Spoonacular   │        USDA             │
│  Facts API      │      API        │  FoodData Central       │
│  (Free)         │  ($10/month)    │      (Free)             │
│                 │                 │                         │
│ • Barcode scan  │ • Recipes       │ • Nutrition accuracy    │
│ • Product DB    │ • Meal planning │ • Government data       │
│ • Ingredients   │ • Food ontology │ • Cross-validation      │
└─────────────────┴─────────────────┴─────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Supabase     │
                    │   PostgreSQL    │
                    │                 │
                    │ • User data     │
                    │ • Meal logs     │
                    │ • Preferences   │
                    │ • Cache layer   │
                    └─────────────────┘
```

### Data Flow Architecture

```
User Input → AI Processing → Multi-API Query → Data Synthesis → Response
     │              │              │               │            │
     ▼              ▼              ▼               ▼            ▼
┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ ┌─────────┐
│ Voice/  │ │ Context +   │ │ Parallel    │ │ Data    │ │ UI      │
│ Text    │ │ Intent      │ │ API Calls   │ │ Fusion  │ │ Update  │
│ Input   │ │ Analysis    │ │ + Caching   │ │ Logic   │ │ + Chat  │
└─────────┘ └─────────────┘ └─────────────┘ └─────────┘ └─────────┘
```

## Conversational AI Architecture

### AI Processing Pipeline

```javascript
// Conversation Flow Architecture
const conversationPipeline = {
  // Stage 1: Input Processing
  inputAnalysis: {
    speechToText: 'Expo Speech API',
    intentRecognition: 'OpenAI GPT-4o-mini',
    contextExtraction: 'Custom NLP pipeline'
  },
  
  // Stage 2: Data Retrieval  
  dataGathering: {
    userContext: 'Supabase user preferences',
    nutritionData: 'Multi-API parallel queries',
    conversationHistory: 'Last 10 turns cached'
  },
  
  // Stage 3: Response Generation
  responseGeneration: {
    aiModel: 'OpenAI GPT-4o-mini',
    responseType: 'conversational + structured data',
    actionExtraction: 'Custom action parser'
  },
  
  // Stage 4: Action Execution
  actionExecution: {
    dataUpdates: 'Supabase real-time updates',
    uiUpdates: 'Zustand state management',
    followupQueries: 'Proactive suggestions'
  }
};
```

### Conversation State Management

```typescript
interface ConversationState {
  sessionId: string;
  userId: string;
  context: {
    // Core user data
    nutritionGoals: NutritionGoals;
    dietaryRestrictions: string[];
    mealHistory: MealLog[];
    
    // Conversation context
    recentMessages: Message[];
    currentIntent: 'meal_planning' | 'food_logging' | 'substitution' | 'general';
    pendingActions: PendingAction[];
    
    // API state
    lastApiCalls: APICallHistory;
    cachedData: CachedNutritionData;
  };
  
  // Real-time updates
  realTimeState: {
    isTyping: boolean;
    streamingResponse: boolean;
    pendingApiCalls: string[];
  };
}
```

## Database Schema Design

### Supabase PostgreSQL Schema

```sql
-- User management and preferences
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  nutrition_goals JSONB, -- {calories: 2000, protein: 150, carbs: 250, fat: 65}
  dietary_restrictions TEXT[],
  activity_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal logging with AI confidence scoring
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  fiber DECIMAL,
  sugar DECIMAL,
  sodium DECIMAL,
  confidence DECIMAL CHECK (confidence >= 0 AND confidence <= 1),
  data_source TEXT, -- 'spoonacular', 'usda', 'open_food_facts', 'user_input'
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation history for context
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  message_type TEXT CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB, -- intent, actions, api_calls, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API response caching
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL, -- 'spoonacular', 'usda', 'open_food_facts'
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal planning and weekly schedules
CREATE TABLE weekly_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  meals JSONB NOT NULL, -- {monday: {...}, tuesday: {...}, etc.}
  generated_by TEXT DEFAULT 'ai', -- 'ai', 'user', 'hybrid'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meal_logs_user_id_date ON meal_logs(user_id, logged_at);
CREATE INDEX idx_conversations_user_session ON conversations(user_id, session_id);
CREATE INDEX idx_api_cache_key_expires ON api_cache(cache_key, expires_at);
```

## Performance Architecture

### Caching Strategy

```javascript
// Multi-layer caching implementation
const cachingStrategy = {
  // L1: In-memory cache (React Native)
  inMemory: {
    conversationContext: '1 hour TTL',
    userPreferences: 'No TTL (update on change)',
    recentApiResponses: '15 minutes TTL'
  },
  
  // L2: Device storage (AsyncStorage)
  localStorage: {
    userProfile: 'Persist until logout',
    offlineMealPlans: '7 days TTL',
    conversationHistory: '30 days TTL'
  },
  
  // L3: Database cache (Supabase)
  databaseCache: {
    apiResponses: 'Variable TTL by source',
    nutritionData: '30 days TTL',
    recipeData: '7 days TTL'
  }
};
```

### API Request Optimization

```javascript
// Parallel API call architecture
const optimizedApiStrategy = {
  // Batch related queries
  batchQueries: async (queries) => {
    const [spoonacular, usda, openFoodFacts] = await Promise.allSettled([
      spoonacularAPI.batchQuery(queries),
      usdaAPI.batchQuery(queries),
      openFoodFactsAPI.batchQuery(queries)
    ]);
    
    return synthesizeResults(spoonacular, usda, openFoodFacts);
  },
  
  // Smart request deduplication
  deduplication: {
    keyGenerator: (query) => hash(query.food + query.portion),
    cacheFirst: true,
    maxCacheAge: 3600 // 1 hour
  },
  
  // Rate limiting with queues
  rateLimiting: {
    spoonacular: new TokenBucket(5, 1), // 5 req/sec
    usda: new TokenBucket(1, 4), // 1 req/4sec  
    openFoodFacts: new TokenBucket(10, 1) // 10 req/sec
  }
};
```

## Real-Time Updates Architecture

### Supabase Real-Time Integration

```javascript
// Real-time subscription setup
const realTimeSubscriptions = {
  // Meal log updates
  mealLogs: supabase
    .channel(`meal_logs:user_id=eq.${userId}`)
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meal_logs' },
        handleMealLogUpdate
    ),
    
  // Conversation sync across devices  
  conversations: supabase
    .channel(`conversations:user_id=eq.${userId}`)
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversations' },
        handleNewMessage
    ),
    
  // Meal plan updates
  mealPlans: supabase
    .channel(`meal_plans:user_id=eq.${userId}`)
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_meal_plans' },
        handleMealPlanUpdate
    )
};
```

## Security Architecture

### API Security Implementation

```javascript
const securityLayer = {
  // Request signing for sensitive endpoints
  requestSigning: {
    algorithm: 'HMAC-SHA256',
    keyRotation: '30 days',
    timestampWindow: '5 minutes'
  },
  
  // Rate limiting per user
  userRateLimiting: {
    conversationsPerHour: 100,
    apiCallsPerDay: 1000,
    mealLogsPerDay: 50
  },
  
  // Data encryption
  encryption: {
    personalData: 'AES-256-GCM',
    apiKeys: 'Environment variables + Expo SecureStore',
    conversations: 'End-to-end encryption option'
  },
  
  // Input sanitization
  sanitization: {
    userMessages: 'Strip HTML, validate length',
    apiResponses: 'Schema validation',
    nutritionData: 'Range validation'
  }
};
```

## Monitoring & Analytics Architecture

### System Health Monitoring

```javascript
const monitoringStack = {
  // Performance metrics
  performance: {
    apiResponseTimes: 'Real-time tracking',
    appLaunchTime: 'Device performance metrics',
    conversationLatency: 'End-to-end timing',
    cacheHitRates: 'Multi-layer cache analysis'
  },
  
  // Business metrics  
  business: {
    userEngagement: 'Daily/weekly active conversations',
    featureUsage: 'Meal planning vs logging vs substitutions',
    conversionRates: 'Free to premium conversion tracking',
    retentionCohorts: 'Weekly and monthly retention analysis'
  },
  
  // Error tracking
  errors: {
    apiFailures: 'Failure rates by source',
    conversationErrors: 'AI response quality issues',
    crashReporting: 'Client-side error tracking',
    dataInconsistencies: 'Cross-API validation failures'
  }
};
```

## Scalability Considerations

### Horizontal Scaling Strategy

```
Current Architecture (0-1K users):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ React Native│    │   Supabase  │    │  3rd Party  │
│   Client    │◄──►│  Single DB  │◄──►│    APIs     │
└─────────────┘    └─────────────┘    └─────────────┘

Scale-Up Architecture (1K-10K users):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ React Native│    │   Supabase  │    │   Redis     │
│   Client    │◄──►│  + Read     │◄──►│   Cache     │
└─────────────┘    │  Replicas   │    │   Layer     │
                   └─────────────┘    └─────────────┘

Scale-Out Architecture (10K+ users):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ React Native│    │    CDN +    │    │ Microservices│
│   Client    │◄──►│  Load Bal.  │◄──►│   Backend   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Development & Deployment Pipeline

### CI/CD Architecture

```yaml
Development Pipeline:
  Source Control: GitHub
  Branching: GitFlow (main/develop/feature)
  
  Continuous Integration:
    - GitHub Actions
    - Automated testing (Jest, Detox)
    - Code quality (ESLint, TypeScript)
    - Security scanning (Snyk)
    
  Continuous Deployment:
    - Expo Application Services (EAS)
    - Preview deployments for PRs
    - Staged rollouts (10% → 50% → 100%)
    - Automated rollback on errors

Environment Strategy:
  - Development: Local development with API mocks
  - Staging: Full API integration testing
  - Production: Live APIs with monitoring
```

## Success Metrics & KPIs

### Technical Performance

- **API Response Time**: 95% under 2 seconds
- **App Launch Time**: Under 2 seconds cold start
- **Cache Hit Rate**: 60-80% for nutrition queries
- **Uptime**: 99.5% availability across all services
- **Data Accuracy**: 95%+ cross-verified with USDA

### User Experience

- **Conversation Success Rate**: 90%+ user intents resolved
- **Multi-API Fallback**: 99% success rate when primary APIs fail
- **Real-time Updates**: Sub-second UI updates after data changes
- **Offline Capability**: Core features work without internet

### Business Impact

- **Cost Efficiency**: Under $15/month during bootstrap phase
- **User Retention**: 60%+ 30-day retention rate
- **Conversion Rate**: 15%+ free to premium conversion
- **Feature Adoption**: 70%+ users engage with AI conversation features

## Risk Mitigation

### Technical Risks

1. **API Vendor Lock-in**: Multi-API architecture reduces dependency
2. **Rate Limiting**: Intelligent caching and queuing systems
3. **Data Quality**: Cross-validation between USDA and Spoonacular
4. **Performance**: Multi-layer caching and parallel processing
5. **Security**: Encryption, sanitization, and rate limiting

### Business Risks

1. **API Cost Scaling**: Usage monitoring and cost alerts
2. **User Adoption**: Freemium model with immediate value
3. **Competition**: Focus on conversational UX differentiation
4. **Regulatory**: HIPAA-ready architecture for future compliance

This architecture provides a solid foundation for Meal Master AI's hybrid API approach while maintaining scalability, performance, and user experience excellence.