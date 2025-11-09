"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, X, Loader2, User, Lock, AlertCircle } from "lucide-react"

// Password strength calculator
function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 12) {
    score += 25;
  } else {
    feedback.push('Use at least 12 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  if (password.length >= 16) score += 10;

  let label = 'Weak';
  let color = 'bg-red-500';

  if (score >= 80) {
    label = 'Strong';
    color = 'bg-green-500';
  } else if (score >= 60) {
    label = 'Good';
    color = 'bg-yellow-500';
  } else if (score >= 40) {
    label = 'Fair';
    color = 'bg-orange-500';
  }

  return { score, label, color, feedback };
}

function ActivatePageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<{
    name: string
    email: string
    role: string
    expiresAt: string
  } | null>(null)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof calculatePasswordStrength> | null>(null)

  // Verify the token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("No activation token provided")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/auth/activate?token=${token}`)
        
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Invalid activation token")
        }

        const data = await res.json()
        setUserData(data.user)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [token])

  // Calculate password strength on change
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength(null)
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validate password strength
    if (!passwordStrength || passwordStrength.score < 80) {
      setFormError("Please create a stronger password")
      return
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to activate account")
      }

      setSuccess(true)
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Activation Link</h2>
          <p className="text-gray-600">Please wait while we verify your account...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <X className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    const redirectUrl = userData?.role === 'TEACHER' || userData?.role === 'STUDENT' 
      ? 'https://www.acharyaes.com' 
      : '/';
    
    const roleMessage = userData?.role === 'TEACHER' 
      ? 'teacher portal' 
      : userData?.role === 'STUDENT' 
        ? 'student portal' 
        : 'admin dashboard';

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been successfully activated. You can now sign in to the {roleMessage} with your email and the password you just created.
          </p>
          <a
            href={redirectUrl}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Go to {roleMessage === 'admin dashboard' ? 'Sign In' : 'Portal'}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Set Your Password</h2>
        
        {userData && (
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-gray-900">{userData.name}</span>
              </div>
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-gray-900">{userData.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Role:</span>
                <span className="ml-2 text-gray-900 capitalize">
                  {userData.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="text-xs text-blue-600 font-medium">
                  {showPassword ? "HIDE" : "SHOW"}
                </span>
              </button>
            </div>

            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                  <span className={`text-xs font-bold ${
                    passwordStrength.score >= 80 ? 'text-green-600' :
                    passwordStrength.score >= 60 ? 'text-yellow-600' :
                    passwordStrength.score >= 40 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${passwordStrength.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-gray-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <ul className="list-disc list-inside">
                      {passwordStrength.feedback.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !passwordStrength || passwordStrength.score < 80 || password !== confirmPassword}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Activating...
              </>
            ) : (
              "Activate Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ActivatePageContent />
    </Suspense>
  )
}
