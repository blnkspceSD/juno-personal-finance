import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Error
          </h2>
          
          <p className="text-gray-600 mb-6">
            Sorry, we couldn&apos;t verify your email confirmation link. This could happen if the link has expired or has already been used.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/auth/signup"
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Up Again
            </Link>
            
            <Link
              href="/auth/login"
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Signing In
            </Link>
          </div>
          
          <div className="mt-6">
            <p className="text-xs text-gray-500">
              If you continue to have problems, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}