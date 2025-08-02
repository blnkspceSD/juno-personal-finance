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

// Database response types from Supabase
export type DatabaseUser = User
export type DatabaseBudget = Budget
export type DatabaseCategory = Category
export type DatabaseTransaction = Transaction