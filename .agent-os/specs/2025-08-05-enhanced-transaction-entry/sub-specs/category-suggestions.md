# Category Suggestions System

This is the intelligent category suggestions implementation for the spec detailed in @.agent-os/specs/2025-08-05-enhanced-transaction-entry/spec.md

> Created: 2025-08-05
> Version: 1.0.0

## Overview

AI-powered category suggestion system that learns from user behavior and transaction patterns to provide intelligent category recommendations. The system reduces categorization time and improves accuracy through machine learning and user analytics.

## Suggestion Algorithm Components

### 1. Frequency-Based Suggestions

Track category usage patterns for each user:

```typescript
interface CategoryUsage {
  category_id: string;
  user_id: string;
  usage_count: number;
  last_used: Date;
  weekly_frequency: number;
  monthly_frequency: number;
  created_at: Date;
  updated_at: Date;
}
```

**Scoring Formula:**
```typescript
const frequencyScore = (
  (usage_count * 0.4) +
  (recentUsageBonus * 0.3) +
  (weeklyFrequency * 0.2) +
  (monthlyTrend * 0.1)
);
```

### 2. Recent Usage Priority

Prioritize recently used categories:

```typescript
interface RecentCategories {
  user_id: string;
  category_ids: string[]; // Ordered by recency, max 10
  last_updated: Date;
}
```

**Recency Bonus:**
- Last 24 hours: +50 points
- Last 3 days: +30 points  
- Last week: +15 points
- Last month: +5 points

### 3. Description-Based Suggestions

Analyze transaction descriptions for category hints:

```typescript
interface CategoryKeywords {
  category_id: string;
  keywords: string[];
  confidence_scores: number[];
  user_id?: string; // Personal keywords override global
  created_at: Date;
}
```

**Keyword Matching:**
- Exact match: 100% confidence
- Partial match: 70% confidence
- Fuzzy match: 40% confidence
- Synonym match: 60% confidence

### 4. Amount-Based Suggestions

Consider transaction amounts for category hints:

```typescript
interface CategoryAmountPatterns {
  category_id: string;
  user_id: string;
  typical_amount_min: number;
  typical_amount_max: number;
  average_amount: number;
  confidence_threshold: number;
}
```

**Amount Matching Logic:**
- Within typical range: +20 points
- Near average amount: +15 points
- Historical amount pattern: +10 points

### 5. Time-Based Suggestions

Consider transaction timing patterns:

```typescript
interface CategoryTimePatterns {
  category_id: string;
  user_id: string;
  day_of_week_patterns: number[]; // 0-6 frequency
  hour_patterns: number[]; // 0-23 frequency
  monthly_patterns: number[]; // 1-31 frequency
}
```

**Time-Based Scoring:**
- Same day of week: +10 points
- Similar time of day: +8 points
- Monthly pattern match: +5 points

## Machine Learning Enhancement

### Training Data Collection

Collect user interaction data for ML training:

```typescript
interface SuggestionFeedback {
  suggestion_id: string;
  user_id: string;
  transaction_description: string;
  suggested_category: string;
  actual_category: string;
  accepted: boolean;
  feedback_type: 'accept' | 'reject' | 'modify';
  created_at: Date;
}
```

### Feature Engineering

Extract features for ML model:

1. **Text Features:**
   - TF-IDF vectors from descriptions
   - Word embeddings (Word2Vec/BERT)
   - N-gram patterns

2. **Numerical Features:**
   - Transaction amount (normalized)
   - Time of day (cyclical encoding)
   - Day of week (one-hot encoding)
   - Month of year (cyclical encoding)

3. **User Features:**
   - Category usage history
   - User behavior patterns
   - Spending categories frequency

### Model Architecture

```typescript
interface MLCategorySuggestion {
  model_version: string;
  user_id: string;
  transaction_features: TransactionFeatures;
  predictions: CategoryPrediction[];
  confidence_threshold: number;
  last_trained: Date;
}

interface CategoryPrediction {
  category_id: string;
  confidence_score: number;
  reasoning: string[];
  model_features_used: string[];
}
```

## Suggestion Display Logic

### Dropdown Organization

```typescript
interface CategorySuggestionGroup {
  title: string;
  categories: SuggestedCategory[];
  priority: number;
  max_display: number;
}

const suggestionGroups: CategorySuggestionGroup[] = [
  {
    title: "AI Suggestions",
    categories: mlSuggestions,
    priority: 100,
    max_display: 3
  },
  {
    title: "Recent",
    categories: recentCategories,
    priority: 90,
    max_display: 5
  },
  {
    title: "Frequent",
    categories: frequentCategories,
    priority: 80,
    max_display: 5
  },
  {
    title: "All Categories",
    categories: allCategories,
    priority: 10,
    max_display: -1 // No limit
  }
];
```

### Confidence Thresholds

Display suggestions based on confidence levels:

- **High Confidence (>80%)**: Auto-suggest with visual emphasis
- **Medium Confidence (60-80%)**: Display in suggestions section
- **Low Confidence (40-60%)**: Include in expanded suggestions
- **Very Low Confidence (<40%)**: Filter out from suggestions

### Visual Indicators

Show suggestion confidence through UI elements:

```typescript
interface SuggestionDisplay {
  category: Category;
  confidence: number;
  reasoning: string;
  icon: 'ai' | 'recent' | 'frequent' | 'amount' | 'time';
  badge?: 'recommended' | 'popular' | 'new';
}
```

## Real-Time Learning

### Immediate Feedback Integration

Update suggestions based on user selections:

```typescript
const handleCategorySelection = async (
  selectedCategory: string,
  transactionData: TransactionData,
  suggestedCategories: string[]
) => {
  // Update frequency counters
  await updateCategoryUsage(selectedCategory);
  
  // Update recent selections
  await updateRecentCategories(selectedCategory);
  
  // Collect feedback for ML training
  await recordSuggestionFeedback({
    suggested: suggestedCategories,
    selected: selectedCategory,
    transaction: transactionData
  });
  
  // Update keyword associations
  await updateCategoryKeywords(selectedCategory, transactionData.description);
};
```

### Batch Learning Updates

Periodically retrain models with new data:

```typescript
interface BatchLearningJob {
  job_id: string;
  user_id?: string; // null for global model updates
  data_range: DateRange;
  model_type: 'keywords' | 'ml' | 'patterns';
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: Date;
}
```

## Performance Optimization

### Caching Strategy

Cache suggestions to improve response times:

```typescript
interface SuggestionCache {
  cache_key: string; // Hash of user_id + transaction_context
  suggestions: CategorySuggestion[];
  expires_at: Date;
  hit_count: number;
}
```

**Cache Invalidation Triggers:**
- New transaction added
- Category usage patterns change
- User creates new category
- ML model updates

### Database Optimization

Optimize database queries for suggestion generation:

```sql
-- Index for fast category usage lookups
CREATE INDEX idx_category_usage_user_frequency 
ON category_usage (user_id, usage_count DESC, last_used DESC);

-- Index for keyword matching
CREATE INDEX idx_category_keywords_search 
ON category_keywords USING gin(keywords);

-- Index for recent categories
CREATE INDEX idx_recent_categories_user 
ON recent_categories (user_id, last_updated DESC);
```

### API Response Optimization

Structure API responses for efficient client consumption:

```typescript
interface SuggestionResponse {
  suggestions: CategorySuggestion[];
  metadata: {
    total_suggestions: number;
    confidence_threshold: number;
    suggestion_types: string[];
    cache_hit: boolean;
    response_time_ms: number;
  };
  debug_info?: {
    feature_scores: Record<string, number>;
    model_version: string;
    reasoning: string[];
  };
}
```

## Privacy and Security

### Data Privacy

- Store only necessary data for suggestions
- Allow users to clear suggestion history
- Respect user privacy preferences
- Anonymize data for global pattern analysis

### Security Measures

- Validate all user inputs
- Sanitize transaction descriptions
- Rate limit suggestion requests
- Encrypt sensitive training data

## Testing Strategy

### A/B Testing Framework

Test suggestion algorithm improvements:

```typescript
interface SuggestionExperiment {
  experiment_id: string;
  name: string;
  description: string;
  treatment_groups: TreatmentGroup[];
  success_metrics: string[];
  start_date: Date;
  end_date: Date;
  status: 'draft' | 'running' | 'completed' | 'paused';
}

interface TreatmentGroup {
  group_id: string;
  name: string;
  traffic_percentage: number;
  algorithm_config: AlgorithmConfig;
}
```

### Success Metrics

Track suggestion system performance:

- **Accuracy**: Percentage of correct suggestions
- **Acceptance Rate**: How often users accept suggestions
- **Time Saved**: Reduction in categorization time
- **User Satisfaction**: User feedback on suggestions
- **Coverage**: Percentage of transactions with suggestions

### Performance Testing

- Load test suggestion API endpoints
- Benchmark ML model inference time
- Test cache hit rates and invalidation
- Monitor database query performance

## Rollout Strategy

### Phase 1: Basic Frequency-Based Suggestions
- Implement category usage tracking
- Display recent and frequent categories
- A/B test against no suggestions

### Phase 2: Description-Based Enhancement
- Add keyword matching system
- Implement fuzzy string matching
- Train initial keyword associations

### Phase 3: Machine Learning Integration
- Deploy ML model for predictions
- Implement real-time learning feedback
- Add confidence-based filtering

### Phase 4: Advanced Pattern Recognition
- Add time and amount-based patterns
- Implement user behavior clustering
- Deploy personalized suggestion models

## Success Criteria

- 40% improvement in category selection speed
- 85% suggestion acceptance rate for high-confidence predictions
- 30% reduction in transaction categorization errors
- Sub-100ms suggestion generation response time
- 95% user satisfaction with suggestion quality