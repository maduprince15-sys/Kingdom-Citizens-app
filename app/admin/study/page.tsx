import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import StudyResourceManager from './StudyResourceManager'

export default async function AdminStudyPage() {
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

  if (!['admin', 'teacher'].includes(role)) {
    redirect('/dashboard')
  }

  const { data: resources } = await supabase
    .from('study_resources')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <main className='min-h-screen bg-[#050303] p-4 text-white md:p-8'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
              The Kingdom Citizens
            </p>

            <h1 className='mt-2 text-3xl font-bold md:text-5xl'>
              Manage Study Center
            </h1>

            <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-400'>
              Create and manage doctrine lessons, Bible study resources, teaching notes,
              Scripture references, and study materials.
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <Link
              href='/study'
              className='rounded-full border border-yellow-700 px-4 py-2 text-yellow-300'
            >
              View Study Center
            </Link>

            <Link
              href='/dashboard'
              className='rounded-full border border-yellow-700 px-4 py-2 text-yellow-300'
            >
              Dashboard
            </Link>
          </div>
        </div>

        <StudyResourceManager
          resources={resources || []}
          currentUserId={user.id}
        />
      </div>
    </main>
  )
}