# Onboarding Flow Specification

This is the onboarding flow specification for the spec detailed in @.agent-os/specs/2025-08-19-predefined-category-groups/spec.md

> Created: 2025-08-19
> Version: 1.0.0

## Flow Overview

### Purpose
Seamlessly create predefined category groups and starter categories for new users during their initial setup, ensuring they have a complete financial categorization system from day one without overwhelming them with manual setup tasks.

### Trigger Points
- **Primary**: First-time user registration completion
- **Secondary**: Existing user with no categories (retroactive setup)
- **Tertiary**: Manual trigger from user settings (reset categories)

### User Experience Goals
- **Zero Manual Setup**: Categories are created automatically
- **Immediate Value**: Users can start categorizing transactions right away
- **Educational**: Users learn about financial organization best practices
- **Customizable**: Easy to modify or extend the default setup

## Technical Implementation

### Onboarding Hook Architecture

```typescript
interface OnboardingState {
  currentStep: 'detecting' | 'creating' | 'verifying' | 'complete' | 'error';
  progress: number;
  groupsCreated: number;
  categoriesCreated: number;
  error?: string;
}

interface DefaultGroupsSetup {
  totalGroups: number;
  totalCategories: number;
  estimatedDuration: number;
  groups: CategoryGroupTemplate[];
}

const useDefaultGroupsOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'detecting',
    progress: 0,
    groupsCreated: 0,
    categoriesCreated: 0
  });

  const checkUserNeedsSetup = useCallback(async (userId: string) => {
    try {
      setState(prev => ({ ...prev, currentStep: 'detecting', progress: 10 }));

      const { data: existingGroups, error } = await supabase
        .from('category_groups')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;

      const needsSetup = !existingGroups || existingGroups.length === 0;
      
      setState(prev => ({ 
        ...prev, 
        currentStep: needsSetup ? 'creating' : 'complete',
        progress: needsSetup ? 20 : 100
      }));

      return needsSetup;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Detection failed'
      }));
      return false;
    }
  }, []);

  const createDefaultGroups = useCallback(async (userId: string) => {
    try {
      setState(prev => ({ ...prev, currentStep: 'creating', progress: 30 }));

      // Call stored procedure for atomic creation
      const { data, error } = await supabase.rpc(
        'create_default_groups_and_categories',
        {
          user_id_param: userId,
          groups_data: DEFAULT_GROUPS_CONFIG
        }
      );

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create groups');
      }

      setState(prev => ({
        ...prev,
        currentStep: 'verifying',
        progress: 80,
        groupsCreated: data.groups_created?.length || 0,
        categoriesCreated: data.categories_created?.length || 0
      }));

      // Verify creation
      await verifyGroupsCreation(userId);

      setState(prev => ({
        ...prev,
        currentStep: 'complete',
        progress: 100
      }));

      return {
        success: true,
        groupsCreated: data.groups_created?.length || 0,
        categoriesCreated: data.categories_created?.length || 0
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Creation failed'
      }));
      return { success: false, error };
    }
  }, []);

  const verifyGroupsCreation = useCallback(async (userId: string) => {
    const { data: groups, error } = await supabase
      .from('category_groups_with_stats')
      .select('id, name, category_count')
      .eq('user_id', userId);

    if (error) throw error;

    if (!groups || groups.length === 0) {
      throw new Error('No groups were created');
    }

    const totalCategories = groups.reduce((sum, group) => sum + group.category_count, 0);
    
    if (totalCategories === 0) {
      throw new Error('No categories were created');
    }

    return { groups: groups.length, categories: totalCategories };
  }, []);

  return {
    state,
    checkUserNeedsSetup,
    createDefaultGroups,
    reset: () => setState({
      currentStep: 'detecting',
      progress: 0,
      groupsCreated: 0,
      categoriesCreated: 0
    })
  };
};
```

### Default Groups Configuration

```typescript
const DEFAULT_GROUPS_CONFIG = [
  {
    name: 'Core',
    description: 'Essential, non-negotiable expenses that keep your life running',
    color_hex: '#DC2626', // Red - indicates urgency/priority
    sort_order: 1,
    categories: [
      'Groceries',
      'Utilities',
      'Rent/Mortgage', 
      'Gas',
      'Medical',
      'Insurance',
      'Phone/Internet'
    ]
  },
  {
    name: 'Flexible',
    description: 'Necessary but variable expenses that you have some control over',
    color_hex: '#F59E0B', // Amber - indicates caution/consideration
    sort_order: 2,
    categories: [
      'Dining Out',
      'Personal Care',
      'Household Items',
      'Transportation',
      'Pet Care',
      'Clothing',
      'Home Maintenance'
    ]
  },
  {
    name: 'Lifestyle',
    description: 'Discretionary spending for enjoyment and personal interests',
    color_hex: '#10B981', // Green - indicates flexibility/choice
    sort_order: 3,
    categories: [
      'Entertainment',
      'Hobbies',
      'Shopping',
      'Travel',
      'Subscriptions',
      'Books & Education',
      'Gifts'
    ]
  },
  {
    name: 'Savings',
    description: 'Future-focused financial goals and investments',
    color_hex: '#3B82F6', // Blue - indicates stability/growth
    sort_order: 4,
    categories: [
      'Emergency Fund',
      'Vacation Fund',
      'Investments',
      'Debt Repayment',
      'Retirement',
      'Education Fund'
    ]
  }
];

// Category color palette for visual distinction
const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#9CA3AF', '#D1D5DB'
];

// Assign colors to categories systematically
const assignCategoryColors = (categories: string[]): { name: string; color: string }[] => {
  return categories.map((name, index) => ({
    name,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }));
};
```

## User Registration Integration

### Registration Flow Updates

```typescript
// Enhanced user registration with onboarding
const useUserRegistration = () => {
  const { createDefaultGroups, state: onboardingState } = useDefaultGroupsOnboarding();
  
  const registerUser = useCallback(async (
    email: string, 
    password: string, 
    options?: { skipOnboarding?: boolean }
  ) => {
    try {
      // Step 1: Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Set up default groups (unless skipped)
      if (!options?.skipOnboarding) {
        await createDefaultGroups(authData.user.id);
      }

      return {
        user: authData.user,
        onboarding: onboardingState,
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }, [createDefaultGroups, onboardingState]);

  return { registerUser, onboardingState };
};
```

### Existing User Detection

```typescript
// Hook for handling existing users without categories
const useRetroactiveOnboarding = () => {
  const { checkUserNeedsSetup, createDefaultGroups } = useDefaultGroupsOnboarding();
  
  const checkAndSetupUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { needsSetup: false };

    const needsSetup = await checkUserNeedsSetup(user.id);
    
    if (needsSetup) {
      const result = await createDefaultGroups(user.id);
      return { needsSetup: true, setupResult: result };
    }

    return { needsSetup: false };
  }, [checkUserNeedsSetup, createDefaultGroups]);

  return { checkAndSetupUser };
};

// React component for retroactive onboarding
const RetroactiveOnboardingCheck: React.FC = () => {
  const { checkAndSetupUser } = useRetroactiveOnboarding();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!hasChecked) {
      checkAndSetupUser().then((result) => {
        setHasChecked(true);
        if (result.needsSetup) {
          // Show success toast or onboarding completion message
          toast.success('Welcome! We\'ve set up starter categories for you.');
        }
      });
    }
  }, [checkAndSetupUser, hasChecked]);

  return null; // This is a background check component
};
```

## User Interface Components

### Onboarding Progress Indicator

```typescript
const OnboardingProgress: React.FC<{
  state: OnboardingState;
  className?: string;
}> = ({ state, className }) => {
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'detecting':
        return <SearchIcon className="w-5 h-5" />;
      case 'creating':
        return <PlusCircleIcon className="w-5 h-5" />;
      case 'verifying':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'complete':
        return <CheckBadgeIcon className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <QuestionMarkCircleIcon className="w-5 h-5" />;
    }
  };

  const getStepMessage = (step: string) => {
    switch (step) {
      case 'detecting':
        return 'Checking your account setup...';
      case 'creating':
        return `Creating your category groups... (${state.groupsCreated} groups, ${state.categoriesCreated} categories)`;
      case 'verifying':
        return 'Verifying your setup...';
      case 'complete':
        return `Setup complete! Created ${state.groupsCreated} groups with ${state.categoriesCreated} categories.`;
      case 'error':
        return `Setup failed: ${state.error}`;
      default:
        return 'Preparing your account...';
    }
  };

  if (state.currentStep === 'complete') return null;

  return (
    <div className={`onboarding-progress bg-blue-50 border border-blue-200 rounded-lg p-4 ${className || ''}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getStepIcon(state.currentStep)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900">
            Setting up your financial categories
          </p>
          <p className="text-sm text-blue-700">
            {getStepMessage(state.currentStep)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${state.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-600 mt-1">
          <span>Progress</span>
          <span>{state.progress}%</span>
        </div>
      </div>
    </div>
  );
};
```

### Onboarding Success Summary

```typescript
const OnboardingSuccessSummary: React.FC<{
  groupsCreated: CategoryGroup[];
  onContinue: () => void;
  onCustomize?: () => void;
}> = ({ groupsCreated, onContinue, onCustomize }) => {
  return (
    <div className="onboarding-success bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
          <CheckBadgeIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Your financial categories are ready!
        </h2>
        <p className="text-gray-600 mt-2">
          We've organized your spending into {groupsCreated.length} logical groups with{' '}
          {groupsCreated.reduce((sum, group) => sum + group.categories.length, 0)} starter categories.
        </p>
      </div>

      {/* Groups Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {groupsCreated.map(group => (
          <div key={group.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div 
                className="w-3 h-3 rounded mr-2" 
                style={{ backgroundColor: group.color }}
              />
              <h3 className="font-medium text-gray-900">{group.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {group.description}
            </p>
            <div className="text-xs text-gray-500">
              {group.categories.length} categories including:{' '}
              {group.categories.slice(0, 3).map(cat => cat.name).join(', ')}
              {group.categories.length > 3 && `, +${group.categories.length - 3} more`}
            </div>
          </div>
        ))}
      </div>

      {/* Educational Content */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 Pro tip</h4>
        <p className="text-sm text-blue-800">
          These groups follow the <strong>50/30/20 budgeting rule</strong>: Core expenses (50%), 
          Flexible lifestyle spending (30%), and Savings goals (20%). You can always customize 
          these categories later to match your specific needs.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onContinue}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Start using Juno
        </button>
        {onCustomize && (
          <button
            onClick={onCustomize}
            className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Customize categories
          </button>
        )}
      </div>
    </div>
  );
};
```

## Error Handling and Recovery

### Error Recovery Strategies

```typescript
const useOnboardingErrorRecovery = () => {
  const retryOnboarding = useCallback(async (userId: string, attempt: number = 1) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000 * Math.pow(2, attempt); // Exponential backoff

    try {
      // Clean up any partial state
      await cleanupPartialOnboarding(userId);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Retry creation
      const result = await supabase.rpc('create_default_groups_and_categories', {
        user_id_param: userId,
        groups_data: DEFAULT_GROUPS_CONFIG
      });

      if (!result.data?.success && attempt < MAX_RETRIES) {
        return retryOnboarding(userId, attempt + 1);
      }

      return result;

    } catch (error) {
      if (attempt < MAX_RETRIES) {
        return retryOnboarding(userId, attempt + 1);
      }
      throw error;
    }
  }, []);

  const cleanupPartialOnboarding = useCallback(async (userId: string) => {
    // Remove any partially created groups
    await supabase
      .from('categories')
      .delete()
      .eq('user_id', userId)
      .is('category_group_id', null);

    await supabase
      .from('category_groups')
      .delete()
      .eq('user_id', userId)
      .eq('is_default', true);
  }, []);

  return { retryOnboarding, cleanupPartialOnboarding };
};
```

### Fallback UI States

```typescript
const OnboardingErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  onSkip: () => void;
}> = ({ error, onRetry, onSkip }) => {
  return (
    <div className="onboarding-error bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center">
        <XCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Setup encountered an issue
        </h3>
        <p className="text-red-700 mb-4 text-sm">
          {error}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={onSkip}
            className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Integration Points

### App Router Integration

```typescript
// Update app layout to include onboarding check
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <RetroactiveOnboardingCheck />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Dashboard Integration

```typescript
// Dashboard with onboarding-aware loading
const Dashboard: React.FC = () => {
  const { state: onboardingState } = useDefaultGroupsOnboarding();
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false);

  useEffect(() => {
    if (onboardingState.currentStep === 'complete' && 
        onboardingState.groupsCreated > 0) {
      setShowOnboardingSuccess(true);
    }
  }, [onboardingState]);

  return (
    <div className="dashboard">
      {/* Onboarding Success Overlay */}
      {showOnboardingSuccess && (
        <Modal onClose={() => setShowOnboardingSuccess(false)}>
          <OnboardingSuccessSummary
            groupsCreated={[]} // Will be populated with actual data
            onContinue={() => setShowOnboardingSuccess(false)}
          />
        </Modal>
      )}

      {/* Regular Dashboard Content */}
      <RealtimeDashboard />
    </div>
  );
};
```

## Performance and Monitoring

### Onboarding Analytics

```typescript
const useOnboardingAnalytics = () => {
  const trackOnboardingStart = useCallback((userId: string) => {
    analytics.track('onboarding_groups_started', { userId });
  }, []);

  const trackOnboardingSuccess = useCallback((
    userId: string,
    groupsCreated: number,
    categoriesCreated: number,
    duration: number
  ) => {
    analytics.track('onboarding_groups_completed', {
      userId,
      groupsCreated,
      categoriesCreated,
      duration
    });
  }, []);

  const trackOnboardingError = useCallback((
    userId: string,
    error: string,
    step: string
  ) => {
    analytics.track('onboarding_groups_failed', {
      userId,
      error,
      step
    });
  }, []);

  return {
    trackOnboardingStart,
    trackOnboardingSuccess,
    trackOnboardingError
  };
};
```