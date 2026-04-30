'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import GoogleLoginButton from '../components/GoogleLoginButton'

const getURL = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (siteUrl) {
    return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/`
  }

  return 'http://localhost:3000/'
}

const months = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const days = Array.from({ length: 31 }, (_, index) => String(index + 1))

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [birthdayMonth, setBirthdayMonth] = useState('')
  const [birthdayDay, setBirthdayDay] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        router.replace('/dashboard')
        return
      }

      setCheckingUser(false)
    }

    checkUser()
  }, [router, supabase])

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const monthNumber = birthdayMonth ? Number(birthdayMonth) : null
    const dayNumber = birthdayDay ? Number(birthdayDay) : null

    if (!monthNumber || !dayNumber) {
      setMessage('Please select your birthday month and day.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getURL()}auth/callback`,
        data: {
          full_name: fullName,
          birthday_month: monthNumber,
          birthday_day: dayNumber,
          show_birthday: true,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Account created successfully. Check your email and confirm your signup.')
    setLoading(false)
  }

  if (checkingUser) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-[#050303] p-6 text-white'>
        <div className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-6 text-center'>
          <p className='text-yellow-300'>Checking account...</p>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-[#050303] text-white'>
      <section className='flex min-h-screen items-center justify-center px-4 py-10'>
        <div className='w-full max-w-md overflow-hidden rounded-3xl border border-yellow-900/40 bg-[#120707] shadow-2xl shadow-black/50'>
          <div className='bg-gradient-to-br from-black via-[#180707] to-[#260909] p-6 text-center'>
            <img
              src='/kingdom-citizens-logo.png'
              alt='The Kingdom Citizens'
              className='mx-auto h-24 w-24 rounded-full object-cover'
            />

            <p className='mt-4 text-xs uppercase tracking-[0.35em] text-yellow-500'>
              The Kingdom Citizens
            </p>

            <h1 className='mt-2 text-3xl font-black'>
              Create Account
            </h1>

            <p className='mt-3 text-sm leading-6 text-gray-300'>
              Join the Kingdom Citizens member platform for teachings, prayer, calendar, messages, and community life.
            </p>
          </div>

          <div className='p-6'>
            <form onSubmit={handleRegister} className='space-y-4'>
              <div>
                <label className='mb-2 block text-sm text-gray-300'>
                  Full Name
                </label>
                <input
                  type='text'
                  placeholder='Enter your full name'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder-gray-500'
                  required
                />
              </div>

              <div>
                <label className='mb-2 block text-sm text-gray-300'>
                  Birthday Month
                </label>
                <select
                  value={birthdayMonth}
                  onChange={(e) => setBirthdayMonth(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 bg-white p-3 text-black'
                  required
                >
                  <option value=''>Select month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='mb-2 block text-sm text-gray-300'>
                  Birthday Day
                </label>
                <select
                  value={birthdayDay}
                  onChange={(e) => setBirthdayDay(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 bg-white p-3 text-black'
                  required
                >
                  <option value=''>Select day</option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <p className='mt-2 text-xs leading-5 text-gray-400'>
                  We collect only month and day for birthday celebrations. No birth year is collected.
                </p>
              </div>

              <div>
                <label className='mb-2 block text-sm text-gray-300'>
                  Email
                </label>
                <input
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder-gray-500'
                  required
                />
              </div>

              <div>
                <label className='mb-2 block text-sm text-gray-300'>
                  Password
                </label>
                <input
                  type='password'
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 bg-white p-3 text-black placeholder-gray-500'
                  required
                />
              </div>

              <button
                type='submit'
                disabled={loading}
                className='w-full rounded-full bg-yellow-500 p-3 font-bold text-black hover:bg-yellow-400 disabled:opacity-50'
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className='my-5 flex items-center gap-3'>
              <div className='h-px flex-1 bg-yellow-900/50' />
              <span className='text-sm text-gray-400'>or</span>
              <div className='h-px flex-1 bg-yellow-900/50' />
            </div>

            <GoogleLoginButton />

            {message && (
              <p className='mt-4 rounded-xl border border-yellow-900/40 bg-black/30 p-3 text-sm text-yellow-300'>
                {message}
              </p>
            )}

            <div className='mt-6 space-y-3 text-center text-sm'>
              <p className='text-gray-300'>
                Already have an account?{' '}
                <Link href='/login' className='font-bold text-yellow-300 underline'>
                  Login
                </Link>
              </p>

              <p>
                <Link href='/' className='text-gray-500 underline'>
                  Back to public site
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}