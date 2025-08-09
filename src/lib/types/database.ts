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