export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  name: string
  month: string
  year: number
  total_income: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  allocated: number
  spent: number
  budget_id: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  description: string
  category_id: string
  date: string
  created_at: string
  updated_at: string
}

export interface CategoryWithBalance extends Category {
  remaining: number
  percentage: number
}