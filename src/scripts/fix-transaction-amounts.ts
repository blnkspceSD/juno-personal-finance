/**
 * Script to fix existing transaction amounts
 * Converts expense transactions from positive to negative amounts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@/lib/supabase/client'

async function fixTransactionAmounts() {
  const supabase = createClient()

  console.log('Starting transaction amount fix...')

  // Get all transactions to see what's in the database
  const { data: allTransactions, error: fetchAllError } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      description,
      categories (
        name
      )
    `)

  if (fetchAllError) {
    console.error('Error fetching all transactions:', fetchAllError)
    return
  }

  console.log(`Found ${allTransactions?.length || 0} total transactions:`)
  allTransactions?.forEach(tx => {
    console.log(`- ${tx.description}: ${tx.amount} (${tx.categories?.name})`)
  })

  // Get all transactions that are currently positive (should be expenses)
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      description,
      categories (
        name
      )
    `)
    .gt('amount', 0) // Only positive amounts

  if (fetchError) {
    console.error('Error fetching transactions:', fetchError)
    return
  }

  if (!transactions || transactions.length === 0) {
    console.log('No transactions found that need fixing.')
    return
  }

  console.log(`Found ${transactions.length} transactions to review:`)
  
  // List all transactions for review
  transactions.forEach(tx => {
    console.log(`- ${tx.description}: ${tx.amount} (${tx.categories?.name})`)
  })

  // Identify which ones should be expenses (not income)
  const expenseTransactions = transactions.filter(tx => {
    const categoryName = tx.categories?.name?.toLowerCase() || ''
    const description = tx.description.toLowerCase()
    
    // These should remain positive (income categories)
    const isIncome = categoryName.includes('salary') || 
                     categoryName.includes('income') || 
                     categoryName.includes('bonus') || 
                     categoryName.includes('freelance') ||
                     description.includes('salary') ||
                     description.includes('income')
    
    return !isIncome // Return true for expenses
  })

  console.log(`\nIdentified ${expenseTransactions.length} expense transactions to convert to negative:`)
  expenseTransactions.forEach(tx => {
    console.log(`- ${tx.description}: ${tx.amount} → -${tx.amount} (${tx.categories?.name})`)
  })

  if (expenseTransactions.length === 0) {
    console.log('No expense transactions need to be converted.')
    return
  }

  // Update each expense transaction to negative
  console.log('\nUpdating transactions...')
  for (const tx of expenseTransactions) {
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ amount: -Math.abs(tx.amount) }) // Ensure negative
      .eq('id', tx.id)

    if (updateError) {
      console.error(`Error updating transaction ${tx.id}:`, updateError)
    } else {
      console.log(`✓ Updated ${tx.description}: ${tx.amount} → -${tx.amount}`)
    }
  }

  console.log('\nTransaction amount fix completed!')
}

// Export for use in other scripts
export { fixTransactionAmounts }

// Allow running directly
if (require.main === module) {
  fixTransactionAmounts().catch(console.error)
}