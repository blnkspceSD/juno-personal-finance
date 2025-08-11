// Juno Personal Finance - Database Types
// Generated from Supabase schema

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  name: string
  month: string // Format: YYYY-MM
  year: number
  total_income: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  budget_id: string
  name: string
  allocated: number
  spent: number
  sort_order: number
  color: string
  group_id?: string
  archived_at?: string
  description?: string
  icon?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string
  amount: number
  description: string
  date: string // ISO date string
  receipt_url?: string
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface CategoryWithTransactions extends Category {
  transactions: Transaction[]
}

export interface BudgetWithCategories extends Budget {
  categories: CategoryWithTransactions[]
}

// Form types for creating/updating
export interface CreateBudgetForm {
  name: string
  month: string
  year: number
  total_income: number
}

export interface CreateCategoryForm {
  name: string
  allocated: number
  color?: string
  sort_order?: number
  group_id?: string
  description?: string
  icon?: string
  fundingStrategy?: CategoryFundingStrategy
}

export interface CreateTransactionForm {
  category_id: string
  amount: number
  description: string
  date: string
  receipt_url?: string
}

// Update types (all fields optional except id)
export interface UpdateBudgetForm extends Partial<CreateBudgetForm> {
  id: string
}

export interface UpdateCategoryForm extends Partial<CreateCategoryForm> {
  id: string
}

export interface UpdateTransactionForm extends Partial<CreateTransactionForm> {
  id: string
}

// Utility types for envelope budgeting
export interface EnvelopeStatus {
  category: Category
  remaining: number
  percentage_used: number
  is_overspent: boolean
}

// Budget reallocation types
export interface BudgetReallocation {
  id: string
  user_id: string
  budget_id: string
  from_category_id: string
  to_category_id: string
  amount: number
  reason: string
  transaction_id?: string // If reallocation was triggered by a transaction
  created_at: string
  updated_at: string
}

export interface CategoryFundingStrategy {
  type: 'single' | 'smart_split' | 'manual' | 'left_to_budget'
  donors: { categoryId: string; amount: number }[]
  totalAmount: number
  monthlyCap?: number
}

// Budget summary for Available to Spend calculations
export interface BudgetSummary {
  totalIncome: number
  totalAllocated: number
  totalSpent: number
  availableToSpend: number
  leftToBudget: number
}

// Category with computed budget metrics
export interface CategoryWithMetrics extends Category {
  headroom: number // allocated - spent
  utilizationRate: number // spent / allocated
  isOverspent: boolean
  needsFunding: boolean
}

export interface BudgetSummary {
  total_income: number
  total_allocated: number
  total_spent: number
  available_to_budget: number
  categories_count: number
  overspent_categories: number
}

// Category suggestions types
export interface CategoryUsage {
  id: string
  user_id: string
  category_id: string
  usage_count: number
  last_used: string
  weekly_frequency: number
  monthly_frequency: number
  created_at: string
  updated_at: string
}

export interface RecentCategories {
  id: string
  user_id: string
  category_ids: string[]
  last_updated: string
}

export interface CategoryKeywords {
  id: string
  category_id: string
  user_id: string | null
  keywords: string[]
  confidence_scores: number[]
  created_at: string
  updated_at: string
}

export interface CategoryAmountPatterns {
  id: string
  user_id: string
  category_id: string
  typical_amount_min: number
  typical_amount_max: number
  average_amount: number
  confidence_threshold: number
  transaction_count: number
  created_at: string
  updated_at: string
}

export interface CategoryTimePatterns {
  id: string
  user_id: string
  category_id: string
  day_of_week_patterns: number[]
  hour_patterns: number[]
  monthly_patterns: number[]
  created_at: string
  updated_at: string
}

// Category suggestion response types
export interface CategorySuggestion {
  category_id: string
  category_name: string
  confidence_score: number
  reasoning: string[]
  suggestion_type: 'frequent' | 'recent' | 'description' | 'amount' | 'time' | 'ai'
  icon?: string
  badge?: 'recommended' | 'popular' | 'new'
}

export interface CategorySuggestionGroup {
  title: string
  categories: CategorySuggestion[]
  priority: number
  max_display: number
}

// Enhanced Category Management Types

export interface CategoryGroup {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  icon?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BudgetAllocation {
  id: string
  user_id: string
  from_category_id?: string
  to_category_id?: string
  amount: number
  reason?: string
  allocation_type: 'manual' | 'automatic' | 'system'
  created_at: string
}

// Alias for budget reallocation operations
export type BudgetReallocation = Omit<BudgetAllocation, 'id' | 'user_id' | 'created_at'>

// Extended category types with group information
export interface CategoryWithGroup extends Category {
  group?: CategoryGroup
  group_name?: string
  group_color?: string
  group_icon?: string
}

// Category management form types
export interface CreateCategoryGroupForm {
  name: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
}

export interface UpdateCategoryGroupForm extends Partial<CreateCategoryGroupForm> {
  id: string
}

export interface CategoryReallocationForm {
  from_category_id?: string
  to_category_id?: string
  amount: number
  reason?: string
  allocation_type?: 'manual' | 'automatic' | 'system'
}

// Budget allocation insights
export interface CategoryAllocationSummary {
  category_id: string
  category_name: string
  allocated: number
  spent: number
  remaining: number
  total_allocated_in: number
  total_allocated_out: number
  allocation_count: number
}

// Smart suggestions for budget reallocation
export interface DonorSuggestion {
  category_id: string
  category_name: string
  available_amount: number
  utilization_rate: number
  confidence_score: number
  reasoning: string[]
}

export interface ReallocationSuggestion {
  suggested_donors: DonorSuggestion[]
  total_available: number
  recommended_allocation: { category_id: string; amount: number }[]
}

// Category organization types
export interface CategoryOrganizationState {
  groups: CategoryGroup[]
  ungrouped_categories: Category[]
  archived_categories: Category[]
}

export interface BulkCategoryOperation {
  operation: 'archive' | 'restore' | 'move_to_group' | 'reorder'
  category_ids: string[]
  target_group_id?: string
  new_sort_orders?: { category_id: string; sort_order: number }[]
}

// Category templates for quick setup
export interface CategoryTemplate {
  name: string
  description?: string
  color: string
  icon?: string
  suggested_allocation?: number
  group_suggestion?: string
}

export const DEFAULT_CATEGORY_TEMPLATES: CategoryTemplate[] = [
  { name: 'Food & Dining', color: '#ef4444', icon: '🍽️', suggested_allocation: 400, group_suggestion: 'Essentials' },
  { name: 'Transportation', color: '#3b82f6', icon: '🚗', suggested_allocation: 200, group_suggestion: 'Essentials' },
  { name: 'Housing & Utilities', color: '#8b5cf6', icon: '🏠', suggested_allocation: 1200, group_suggestion: 'Bills' },
  { name: 'Entertainment', color: '#10b981', icon: '🎬', suggested_allocation: 150, group_suggestion: 'Lifestyle' },
  { name: 'Shopping', color: '#f59e0b', icon: '🛍️', suggested_allocation: 200, group_suggestion: 'Lifestyle' },
  { name: 'Healthcare', color: '#ec4899', icon: '🏥', suggested_allocation: 100, group_suggestion: 'Essentials' },
  { name: 'Emergency Fund', color: '#dc2626', icon: '🆘', suggested_allocation: 500, group_suggestion: 'Savings' },
  { name: 'Travel', color: '#06b6d4', icon: '✈️', suggested_allocation: 300, group_suggestion: 'Goals' }
]

export const DEFAULT_CATEGORY_GROUPS: Omit<CategoryGroup, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Bills', description: 'Fixed monthly expenses', color: '#dc2626', icon: '📋', sort_order: 0 },
  { name: 'Essentials', description: 'Necessary daily expenses', color: '#059669', icon: '🛒', sort_order: 1 },
  { name: 'Lifestyle', description: 'Fun and personal expenses', color: '#7c3aed', icon: '🎨', sort_order: 2 },
  { name: 'Goals', description: 'Savings and future planning', color: '#2563eb', icon: '🎯', sort_order: 3 },
  { name: 'Savings', description: 'Emergency and long-term savings', color: '#0891b2', icon: '💰', sort_order: 4 }
]

// Database response types from Supabase
export type DatabaseUser = User
export type DatabaseBudget = Budget
export type DatabaseCategory = Category
export type DatabaseTransaction = Transaction
export type DatabaseCategoryUsage = CategoryUsage
export type DatabaseRecentCategories = RecentCategories
export type DatabaseCategoryKeywords = CategoryKeywords
export type DatabaseCategoryAmountPatterns = CategoryAmountPatterns
export type DatabaseCategoryTimePatterns = CategoryTimePatterns
export type DatabaseCategoryGroup = CategoryGroup
export type DatabaseBudgetAllocation = BudgetAllocation