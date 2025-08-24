import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Juno Personal Finance</h1>
        <p className="text-muted-foreground mb-6">Take control of your finances with envelope budgeting</p>
        
        <div className="space-y-4">
          <Link
            href="/auth/signup"
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
          >
            Get Started Free
          </Link>
          
          <Link
            href="/auth/login"
            className="w-full inline-flex justify-center items-center py-3 px-4 border border-border text-sm font-medium rounded-xl text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Simple envelope budgeting inspired by YNAB
          </p>
        </div>
      </div>
    </div>
  );
}
