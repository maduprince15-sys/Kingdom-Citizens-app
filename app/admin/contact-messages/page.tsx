import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import ContactMessagesManager from './ContactMessagesManager'

export default async function AdminContactMessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'member'

  if (!['admin', 'moderator'].includes(role)) {
    redirect('/dashboard')
  }

  const { data: messages } = await supabase
    .from('public_contact_messages')
    .select('id, name, email, subject, message, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <main className='min-h-screen bg-[#050303] p-4 text-white md:p-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
              The Kingdom Citizens
            </p>

            <h1 className='mt-2 text-3xl font-bold md:text-5xl'>
              Public Contact Messages
            </h1>

            <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-400'>
              Read and manage messages sent from the public contact box.
            </p>
          </div>

          <Link
            href='/dashboard'
            className='rounded-full border border-yellow-700 px-4 py-2 text-yellow-300'
          >
            Dashboard
          </Link>
        </div>

        <ContactMessagesManager messages={messages || []} />
      </div>
    </main>
  )
}