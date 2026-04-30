import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import PublicHeader from '../../components/PublicHeader'
import PublicFooter from '../../components/PublicFooter'

type StudyProgressRow = {
  id: string
  resource_id: string
  is_bookmarked: boolean
  is_completed: boolean
  progress_percent: number
  personal_note: string | null
  completed_at: string | null
  updated_at: string
  study_resources: {
    id: string
    title: string
    category: string | null
    summary: string | null
    resource_type: string | null
    image_url: string | null
    scripture_references: string | null
    is_published: boolean
    is_public: boolean
  } | null
}

function getProgressStatus(row: StudyProgressRow) {
  if (row.is_completed) return 'Completed'
  if (row.progress_percent > 0) return 'In Progress'
  if (row.is_bookmarked) return 'Bookmarked'
  return 'Started'
}

function getStatusColor(row: StudyProgressRow) {
  if (row.is_completed) return 'border-green-700/50 bg-green-950/30 text-green-300'
  if (row.progress_percent > 0) return 'border-yellow-700/50 bg-yellow-950/30 text-yellow-300'
  if (row.is_bookmarked) return 'border-blue-700/50 bg-blue-950/30 text-blue-300'
  return 'border-gray-700/50 bg-gray-950/30 text-gray-300'
}

export default async function StudyProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const { data: progressRows, error: progressError } = await supabase
    .from('study_progress')
    .select(`
      id,
      resource_id,
      is_bookmarked,
      is_completed,
      progress_percent,
      personal_note,
      completed_at,
      updated_at,
      study_resources (
        id,
        title,
        category,
        summary,
        resource_type,
        image_url,
        scripture_references,
        is_published,
        is_public
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const rows = ((progressRows || []) as unknown as StudyProgressRow[]).filter(
    (row) => row.study_resources?.is_published && row.study_resources?.is_public
  )

  const bookmarkedRows = rows.filter((row) => row.is_bookmarked)
  const completedRows = rows.filter((row) => row.is_completed)
  const inProgressRows = rows.filter(
    (row) => !row.is_completed && row.progress_percent > 0
  )

  return (
    <main className='min-h-screen bg-[#050303] pb-20 text-white md:pb-0'>
      <PublicHeader />

      <section className='border-b border-yellow-900/40 bg-gradient-to-br from-black via-[#130606] to-[#260909] px-4 py-10 md:px-8 md:py-16'>
        <div className='mx-auto max-w-6xl'>
          <p className='text-xs uppercase tracking-[0.35em] text-yellow-500'>
            Study Center
          </p>

          <div className='mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
            <div>
              <h1 className='text-4xl font-black md:text-6xl'>
                My Study Progress
              </h1>

              <p className='mt-4 max-w-3xl text-sm leading-7 text-gray-300 md:text-base'>
                Continue your studies, review bookmarked resources, track completed lessons,
                and revisit your private study notes.
              </p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Link
                href='/study'
                className='rounded-full border border-yellow-700 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-900/20'
              >
                Study Center
              </Link>

              <Link
                href='/dashboard'
                className='rounded-full border border-yellow-700 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-900/20'
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-8 md:px-8'>
        {progressError && (
          <div className='mb-6 rounded border border-red-700 bg-red-950/40 p-4 text-red-300'>
            Error loading study progress: {progressError.message}
          </div>
        )}

        <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'>
            <p className='text-xs uppercase tracking-[0.25em] text-yellow-500'>
              Total Saved
            </p>
            <p className='mt-2 text-3xl font-bold'>{rows.length}</p>
          </div>

          <div className='rounded-2xl border border-blue-900/40 bg-[#120707] p-5'>
            <p className='text-xs uppercase tracking-[0.25em] text-blue-400'>
              Bookmarked
            </p>
            <p className='mt-2 text-3xl font-bold'>{bookmarkedRows.length}</p>
          </div>

          <div className='rounded-2xl border border-yellow-900/40 bg-[#120707] p-5'>
            <p className='text-xs uppercase tracking-[0.25em] text-yellow-400'>
              In Progress
            </p>
            <p className='mt-2 text-3xl font-bold'>{inProgressRows.length}</p>
          </div>

          <div className='rounded-2xl border border-green-900/40 bg-[#120707] p-5'>
            <p className='text-xs uppercase tracking-[0.25em] text-green-400'>
              Completed
            </p>
            <p className='mt-2 text-3xl font-bold'>{completedRows.length}</p>
          </div>
        </div>

        <div className='mb-6 rounded-2xl border border-yellow-900/40 bg-[#120707] p-5 md:p-6'>
          <h2 className='text-2xl font-bold text-yellow-300'>
            Saved Study Resources
          </h2>

          <p className='mt-2 text-sm leading-6 text-gray-400'>
            These are resources where you saved progress, bookmarked, completed, or wrote a private note.
          </p>
        </div>

        <div className='space-y-5'>
          {rows.map((row) => {
            const resource = row.study_resources

            if (!resource) return null

            return (
              <article
                key={row.id}
                className='overflow-hidden rounded-2xl border border-yellow-900/40 bg-[#120707] shadow-lg shadow-black/30'
              >
                <div className='grid grid-cols-1 md:grid-cols-[240px_1fr]'>
                  {resource.image_url ? (
                    <img
                      src={resource.image_url}
                      alt={resource.title}
                      className='h-60 w-full object-cover md:h-full'
                    />
                  ) : (
                    <div className='flex h-60 items-center justify-center bg-black/40 md:h-full'>
                      <span className='text-6xl font-black text-yellow-500'>
                        {resource.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className='p-5 md:p-6'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusColor(row)}`}
                      >
                        {getProgressStatus(row)}
                      </span>

                      <span className='rounded-full border border-yellow-900/40 bg-black/30 px-3 py-1 text-xs text-yellow-300'>
                        {row.progress_percent || 0}% progress
                      </span>

                      {row.is_bookmarked && (
                        <span className='rounded-full border border-blue-900/40 bg-blue-950/30 px-3 py-1 text-xs text-blue-300'>
                          Bookmarked
                        </span>
                      )}
                    </div>

                    <p className='mt-4 text-xs uppercase tracking-[0.25em] text-yellow-500'>
                      {resource.category || resource.resource_type || 'Study'}
                    </p>

                    <h3 className='mt-2 text-2xl font-bold'>
                      {resource.title}
                    </h3>

                    {resource.summary && (
                      <p className='mt-3 text-sm leading-7 text-gray-300'>
                        {resource.summary}
                      </p>
                    )}

                    {resource.scripture_references && (
                      <p className='mt-3 text-xs leading-6 text-yellow-300'>
                        Scriptures: {resource.scripture_references}
                      </p>
                    )}

                    {row.personal_note && (
                      <div className='mt-4 rounded-xl border border-yellow-900/30 bg-black/30 p-4'>
                        <p className='text-xs uppercase tracking-[0.2em] text-yellow-500'>
                          My Private Note
                        </p>

                        <p className='mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-300'>
                          {row.personal_note}
                        </p>
                      </div>
                    )}

                    <div className='mt-5 flex flex-wrap gap-3'>
                      <Link
                        href={`/study/${resource.id}`}
                        className='rounded-full bg-yellow-500 px-5 py-3 text-sm font-bold text-black hover:bg-yellow-400'
                      >
                        Continue Study →
                      </Link>

                      <Link
                        href='/study'
                        className='rounded-full border border-yellow-700 px-5 py-3 text-sm font-bold text-yellow-300 hover:bg-yellow-900/20'
                      >
                        Study Center
                      </Link>
                    </div>

                    <p className='mt-4 text-xs text-gray-500'>
                      Last updated: {new Date(row.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}

          {rows.length === 0 && (
            <div className='rounded-2xl border border-yellow-900/30 bg-[#120707] p-6 text-gray-400'>
              You have not saved any study progress yet. Open a study resource, then bookmark it,
              mark it complete, or save a private note.
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </main>
  )
}