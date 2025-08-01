import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get current month's budget
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM format
  const currentYear = currentDate.getFullYear()

  const { data: currentBudget } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .single()

  const { data: categories } = currentBudget
    ? await supabase
        .from('categories')
        .select('*')
        .eq('budget_id', currentBudget.id)
        .order('sort_order')
    : { data: [] }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Budget Dashboard
          </h2>
          
          {!currentBudget ? (
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-6">
                Let's get started by creating your first monthly budget for {currentMonth}.
              </p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium">
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {currentBudget.name} - ${currentBudget.total_income.toLocaleString()}
                </h3>
                
                {categories && categories.length > 0 ? (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-gray-500">
                            Spent: ${category.spent.toLocaleString()} of ${category.allocated.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            category.allocated - category.spent >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ${(category.allocated - category.spent).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">remaining</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Your budget is ready! Now let's add some categories to allocate your income.
                    </p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium">
                      Add Categories
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-sm font-medium text-gray-500">Total Income</h4>
                  <p className="text-2xl font-bold text-gray-900">
                    ${currentBudget.total_income.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-sm font-medium text-gray-500">Allocated</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${categories?.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-sm font-medium text-gray-500">Remaining</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    ${(currentBudget.total_income - (categories?.reduce((sum, cat) => sum + cat.allocated, 0) || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}