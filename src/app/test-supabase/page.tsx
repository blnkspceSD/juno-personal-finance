import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Test basic connection by checking auth status
  const { data: authData, error } = await supabase.auth.getUser()

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error.message}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          This error suggests the connection credentials are working but there might be a database setup issue.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        ✅ Successfully connected to Supabase!
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold mb-2">Connection Details:</h3>
        <ul className="space-y-1 text-sm">
          <li>🔗 <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</li>
          <li>🔑 <strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.substring(0, 20)}...</li>
          <li>👤 <strong>Auth Status:</strong> {authData.user ? 'Logged in' : 'Anonymous (expected)'}</li>
        </ul>
      </div>
    </div>
  )
}